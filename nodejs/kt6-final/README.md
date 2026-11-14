TaskFlow API

Бэкенд для небольшого менеджера задач. Пользователь заводит проекты, создаёт в них задачи, назначает исполнителей и обсуждает задачи в комментариях.

Express 5, Prisma + PostgreSQL, Redis (хранит refresh токены), JWT, Joi, Swagger UI. Тесты на Jest и Supertest.

Модели: User, Project, Task, Comment. Роли USER и ADMIN. При удалении проекта удаляются его задачи и комментарии, при удалении исполнителя у задачи просто обнуляется assignee.


Запуск через Docker

cp .env.example .env
docker compose up --build

Поднимаются app, db и redis, миграции применяются при старте контейнера. Данные лежат в volumes и после перезапуска не теряются.

Тестовые данные: docker compose exec app node prisma/seed.js
Пользователи admin@example.com (ADMIN), ivan@example.com, olga@example.com, у всех пароль password123.

API: http://localhost:3000
Swagger: http://localhost:3000/api/docs
health: http://localhost:3000/health


Локальная разработка и тесты

База и Redis всё равно из docker compose, само приложение через node:

npm install
cp .env.example .env
cp .env.test.example .env.test
docker compose up -d db redis
npm run db:deploy
npm run db:seed
npm run dev

npm test гоняет тесты на отдельной базе taskflow_test и Redis db 1, так что рабочие данные не трогаются.


Эндпоинты

Всё, кроме /api/auth, /health и /api/docs, требует заголовок Authorization: Bearer <accessToken>.

Auth:
POST /api/auth/register
POST /api/auth/login - access token в ответе, refresh в httpOnly cookie, не больше 10 попыток за 15 минут
POST /api/auth/refresh - выдаёт новую пару, старый refresh после этого не работает
POST /api/auth/logout
GET /api/auth/me

Users (только ADMIN):
GET /api/users - фильтры search, role, пагинация page, limit
PATCH /api/users/:id/role

Projects:
GET /api/projects - search, ownerId, mine, page, limit
GET /api/projects/:id - вместе с количеством задач по статусам
POST /api/projects
PATCH /api/projects/:id, DELETE /api/projects/:id - владелец или ADMIN

Tasks:
GET /api/tasks - projectId, status, priority, assigneeId, search, overdue, sort, order, page, limit
GET /api/tasks/:id - с комментариями
POST /api/tasks
PATCH /api/tasks/:id - автор, владелец проекта или ADMIN, исполнитель может поменять только status
DELETE /api/tasks/:id - автор, владелец проекта или ADMIN

Comments:
GET /api/tasks/:id/comments, POST /api/tasks/:id/comments
PATCH /api/comments/:id, DELETE /api/comments/:id - автор или ADMIN


Формат ответов

Успешный ответ: { "data": ... }, у списков ещё meta: { total, page, limit, pages }.
Ошибка: { "error": { "message": "..." } }, при ошибке валидации плюс details по полям.


Деплой

Деплой на Render по render.yaml: New, Blueprint, выбрать репозиторий. Render сам создаст сервис из Dockerfile, PostgreSQL и Redis, JWT секреты сгенерирует. Тестовые данные можно залить из Shell командой node prisma/seed.js.

Публичный URL:
