from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from pwdlib import PasswordHash

from app import schema
from app.config import settings

TokenType = Literal['access', 'refresh']


def _create_token(subject: schema.JwtSubject, token_type: TokenType, expire_minutes: int) -> str:
	expire = datetime.now(UTC) + timedelta(minutes=expire_minutes)
	to_encode = {'exp': expire, 'sub': subject.model_dump(), 'type': token_type}
	return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: schema.JwtSubject) -> str:
	return _create_token(subject, 'access', settings.JWT_EXPIRE)


def create_refresh_token(subject: schema.JwtSubject) -> str:
	return _create_token(subject, 'refresh', settings.JWT_REFRESH_EXPIRE)


def create_tokens(subject: schema.JwtSubject) -> schema.UserToken:
	return schema.UserToken(
		access_token=create_access_token(subject),
		refresh_token=create_refresh_token(subject),
	)


def decode_token(token: str, token_type: TokenType = 'access') -> schema.JwtSubject:
	raw_token_data = jwt.decode(
		token,
		settings.JWT_SECRET_KEY,
		algorithms=[settings.JWT_ALGORITHM],
		options={'verify_sub': False},
	)

	if raw_token_data.get('type') != token_type:
		raise jwt.InvalidTokenError('Unexpected token type')

	return schema.JwtSubject.model_validate(raw_token_data['sub'])


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return get_password_hash(plain_password) == hashed_password


def get_password_hash(password: str) -> str:
	return password_hasher.hash(password, salt=settings.PASSWORD_SALT)


password_hasher = PasswordHash.recommended()
