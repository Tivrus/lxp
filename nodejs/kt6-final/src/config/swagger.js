const spec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'Менеджер задач: проекты, задачи, комментарии. Авторизация через Bearer access token, refresh token хранится в httpOnly cookie.',
  },
  servers: [
    {
      url: '/',
    },
  ],
  tags: [
    {
      name: 'auth',
      description: 'Регистрация и вход',
    },
    {
      name: 'users',
      description: 'Пользователи (только ADMIN)',
    },
    {
      name: 'projects',
      description: 'Проекты',
    },
    {
      name: 'tasks',
      description: 'Задачи',
    },
    {
      name: 'comments',
      description: 'Комментарии к задачам',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      Id: {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
      },
      Page: {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        description: 'Номер страницы',
      },
      Limit: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        description: 'Размер страницы',
      },
    },
    responses: {
      E400: {
        description: 'Ошибка валидации',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
      E401: {
        description: 'Нет токена или он недействителен',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      E403: {
        description: 'Недостаточно прав',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      E404: {
        description: 'Не найдено',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      E409: {
        description: 'Конфликт (например, email занят)',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      E429: {
        description: 'Слишком много запросов',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
              },
            },
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Ошибка валидации',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      Meta: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 42,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          pages: {
            type: 'integer',
            example: 5,
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Session: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          ownerId: {
            type: 'integer',
          },
          owner: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          _count: {
            type: 'object',
            properties: {
              tasks: {
                type: 'integer',
              },
            },
          },
        },
      },
      ProjectDetails: {
        allOf: [
          {
            $ref: '#/components/schemas/Project',
          },
          {
            type: 'object',
            properties: {
              stats: {
                type: 'object',
                properties: {
                  TODO: {
                    type: 'integer',
                  },
                  IN_PROGRESS: {
                    type: 'integer',
                  },
                  DONE: {
                    type: 'integer',
                  },
                },
              },
            },
          },
        ],
      },
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['TODO', 'IN_PROGRESS', 'DONE'],
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          projectId: {
            type: 'integer',
          },
          authorId: {
            type: 'integer',
          },
          assigneeId: {
            type: 'integer',
            nullable: true,
          },
          project: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              title: {
                type: 'string',
              },
              ownerId: {
                type: 'integer',
              },
            },
          },
          author: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
            },
          },
          assignee: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
            },
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          _count: {
            type: 'object',
            properties: {
              comments: {
                type: 'integer',
              },
            },
          },
        },
      },
      TaskDetails: {
        allOf: [
          {
            $ref: '#/components/schemas/Task',
          },
          {
            type: 'object',
            properties: {
              comments: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Comment',
                },
              },
            },
          },
        ],
      },
      Comment: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          text: {
            type: 'string',
          },
          taskId: {
            type: 'integer',
          },
          authorId: {
            type: 'integer',
          },
          author: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Иван',
          },
          password: {
            type: 'string',
            minLength: 6,
            maxLength: 72,
            example: 'password123',
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'ivan@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },
      RoleInput: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
          },
        },
      },
      ProjectInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Сайт кофейни',
          },
          description: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
          },
        },
      },
      ProjectUpdate: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
          },
          description: {
            type: 'string',
            maxLength: 2000,
            nullable: true,
          },
        },
      },
      TaskInput: {
        type: 'object',
        required: ['title', 'projectId'],
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
            example: 'Сверстать главную',
          },
          description: {
            type: 'string',
            maxLength: 5000,
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['TODO', 'IN_PROGRESS', 'DONE'],
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          projectId: {
            type: 'integer',
            example: 1,
          },
          assigneeId: {
            type: 'integer',
            nullable: true,
          },
        },
      },
      TaskUpdate: {
        type: 'object',
        minProperties: 1,
        description: 'Исполнитель (не автор и не владелец проекта) может передать только status',
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
          },
          description: {
            type: 'string',
            maxLength: 5000,
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['TODO', 'IN_PROGRESS', 'DONE'],
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          assigneeId: {
            type: 'integer',
            nullable: true,
          },
        },
      },
      CommentInput: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
            example: 'Готово, проверьте',
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Регистрация (роль USER)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Пользователь создан',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '409': {
            $ref: '#/components/responses/E409',
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Вход: access token в ответе, refresh token в httpOnly cookie',
        description: 'Не больше 10 попыток за 15 минут с одного IP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Session',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '429': {
            $ref: '#/components/responses/E429',
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['auth'],
        summary: 'Новый access token по refresh cookie (старый refresh становится недействительным)',
        responses: {
          '200': {
            description: 'Новая пара токенов',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Session',
                    },
                  },
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Выход: refresh token удаляется из Redis, cookie очищается',
        responses: {
          '204': {
            description: 'Готово',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['auth'],
        summary: 'Текущий пользователь',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Пользователь',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['users'],
        summary: 'Список пользователей',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description: 'Поиск по имени или email',
          },
          {
            in: 'query',
            name: 'role',
            schema: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
            },
            description: 'Фильтр по роли',
          },
          {
            $ref: '#/components/parameters/Page',
          },
          {
            $ref: '#/components/parameters/Limit',
          },
        ],
        responses: {
          '200': {
            description: 'Пользователи',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                    meta: {
                      $ref: '#/components/schemas/Meta',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
        },
      },
    },
    '/api/users/{id}/role': {
      patch: {
        tags: ['users'],
        summary: 'Изменить роль пользователя',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoleInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Обновлённый пользователь',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['projects'],
        summary: 'Список проектов',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description: 'Поиск по названию',
          },
          {
            in: 'query',
            name: 'ownerId',
            schema: {
              type: 'integer',
            },
            description: 'Проекты конкретного владельца',
          },
          {
            in: 'query',
            name: 'mine',
            schema: {
              type: 'boolean',
            },
            description: 'Только мои проекты',
          },
          {
            $ref: '#/components/parameters/Page',
          },
          {
            $ref: '#/components/parameters/Limit',
          },
        ],
        responses: {
          '200': {
            description: 'Проекты',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Project',
                      },
                    },
                    meta: {
                      $ref: '#/components/schemas/Meta',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
      post: {
        tags: ['projects'],
        summary: 'Создать проект (владелец = текущий пользователь)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProjectInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Проект создан',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['projects'],
        summary: 'Проект со статистикой задач по статусам',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        responses: {
          '200': {
            description: 'Проект',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/ProjectDetails',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      patch: {
        tags: ['projects'],
        summary: 'Изменить проект (владелец или ADMIN)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProjectUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Проект',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Project',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      delete: {
        tags: ['projects'],
        summary: 'Удалить проект вместе с задачами (владелец или ADMIN)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        responses: {
          '204': {
            description: 'Удалено',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['tasks'],
        summary: 'Список задач с фильтрами, сортировкой и пагинацией',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            in: 'query',
            name: 'projectId',
            schema: {
              type: 'integer',
            },
            description: 'Задачи проекта',
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'DONE'],
            },
            description: 'Статус',
          },
          {
            in: 'query',
            name: 'priority',
            schema: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
            },
            description: 'Приоритет',
          },
          {
            in: 'query',
            name: 'assigneeId',
            schema: {
              type: 'integer',
            },
            description: 'Исполнитель',
          },
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description: 'Поиск по названию',
          },
          {
            in: 'query',
            name: 'overdue',
            schema: {
              type: 'boolean',
            },
            description: 'Только просроченные и не выполненные',
          },
          {
            in: 'query',
            name: 'sort',
            schema: {
              type: 'string',
              enum: ['createdAt', 'dueDate', 'priority'],
              default: 'createdAt',
            },
          },
          {
            in: 'query',
            name: 'order',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
          {
            $ref: '#/components/parameters/Page',
          },
          {
            $ref: '#/components/parameters/Limit',
          },
        ],
        responses: {
          '200': {
            description: 'Задачи',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Task',
                      },
                    },
                    meta: {
                      $ref: '#/components/schemas/Meta',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
      post: {
        tags: ['tasks'],
        summary: 'Создать задачу в проекте',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TaskInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Задача создана',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Task',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['tasks'],
        summary: 'Задача с комментариями',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        responses: {
          '200': {
            description: 'Задача',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/TaskDetails',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      patch: {
        tags: ['tasks'],
        summary: 'Изменить задачу (автор, владелец проекта, ADMIN; исполнитель только статус)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TaskUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Задача',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Task',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      delete: {
        tags: ['tasks'],
        summary: 'Удалить задачу (автор, владелец проекта, ADMIN)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        responses: {
          '204': {
            description: 'Удалено',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
    },
    '/api/tasks/{id}/comments': {
      get: {
        tags: ['comments'],
        summary: 'Комментарии задачи',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
          {
            $ref: '#/components/parameters/Page',
          },
          {
            $ref: '#/components/parameters/Limit',
          },
        ],
        responses: {
          '200': {
            description: 'Комментарии',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Comment',
                      },
                    },
                    meta: {
                      $ref: '#/components/schemas/Meta',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      post: {
        tags: ['comments'],
        summary: 'Добавить комментарий',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CommentInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Комментарий',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Comment',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
    },
    '/api/comments/{id}': {
      patch: {
        tags: ['comments'],
        summary: 'Изменить комментарий (автор или ADMIN)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CommentInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Комментарий',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Comment',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/E400',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
      delete: {
        tags: ['comments'],
        summary: 'Удалить комментарий (автор или ADMIN)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            $ref: '#/components/parameters/Id',
          },
        ],
        responses: {
          '204': {
            description: 'Удалено',
          },
          '401': {
            $ref: '#/components/responses/E401',
          },
          '403': {
            $ref: '#/components/responses/E403',
          },
          '404': {
            $ref: '#/components/responses/E404',
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Проверка, что приложение, БД и Redis доступны',
        responses: {
          '200': {
            description: 'Всё работает',
          },
          '503': {
            description: 'БД или Redis недоступны',
          },
        },
      },
    },
  },
}

module.exports = spec
