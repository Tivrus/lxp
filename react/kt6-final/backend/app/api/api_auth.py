from fastapi import APIRouter, status
from jwt import InvalidTokenError
from pydantic import ValidationError

from app import schema, security
from app.api import exceptions
from app.api.dependencies import CurrentUser, OAuth2Form, SessionDatabase
from app.services import auth_service, users_service

auth_router = APIRouter(prefix='/auth', tags=['Аккаунты'])


@auth_router.post(
	'/',
	summary='Регистрация',
	status_code=201,
	responses={
		status.HTTP_409_CONFLICT: {'description': 'Выбранный юзернейм занят'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'Данные не валидны'},
	},
)
def register(
	session: SessionDatabase,
	new_user_payload: schema.User,
) -> None:
	if users_service.get_by_username(session=session, username=new_user_payload.username):
		raise exceptions.ConflictHTTPException(detail='Выбранный юзернейм занят')

	auth_service.register(session=session, user_data=new_user_payload)


@auth_router.post(
	'/login',
	summary='Логин',
	response_model=schema.UserToken,
	status_code=201,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'Некорректное имя или пароль'},
		status.HTTP_422_UNPROCESSABLE_CONTENT: {'description': 'Данные не валидны'},
	},
)
def login(
	session: SessionDatabase,
	user_credentials: OAuth2Form,
) -> schema.UserToken:
	if not users_service.get_by_username(session=session, username=user_credentials.username):
		raise exceptions.LoginHTTPException(detail='Пользователь не найден')

	token = auth_service.authenticate(
		session=session,
		user_data=schema.User(
			username=user_credentials.username, password=user_credentials.password
		),
	)

	if not token:
		raise exceptions.LoginHTTPException(detail='Неверный логин или пароль')

	return token


@auth_router.post(
	'/refresh',
	summary='Обновление токенов',
	description='Выдаёт новую пару access/refresh токенов по действующему refresh-токену',
	response_model=schema.UserToken,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'Refresh-токен недействителен или истёк'},
	},
)
def refresh(
	session: SessionDatabase,
	payload: schema.RefreshRequest,
) -> schema.UserToken:
	try:
		subject = security.decode_token(payload.refresh_token, 'refresh')
	except (InvalidTokenError, ValidationError, KeyError):
		raise exceptions.LoginHTTPException(detail='Сессия истекла, войдите снова')

	user = users_service.get_by_username(session=session, username=subject.username)
	if not user:
		raise exceptions.LoginHTTPException(detail='Пользователь не найден')

	return security.create_tokens(subject=schema.JwtSubject.model_validate(user))


@auth_router.get(
	'/me',
	summary='Информация о текущем залогиненном пользователе',
	response_model=schema.UserResponse,
	responses={
		status.HTTP_401_UNAUTHORIZED: {'description': 'Ошибка токена или пользовательских данных'},
	},
)
def get_current(
	current_user: CurrentUser,
) -> schema.UserResponse:
	return current_user
