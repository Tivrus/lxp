from fastapi import APIRouter, Path, status

from app import schema
from app.api.dependencies import SessionDatabase
from app.api.exceptions import NotFoundHTTPException
from app.services import courses_service

courses_router = APIRouter(
	prefix='/courses',
	tags=['Курсы'],
)


@courses_router.get(
	'/',
	summary='Список курсов',
	response_model=list[schema.Course],
)
def get_courses_list(
	session: SessionDatabase,
):
	return courses_service.get_list(session=session)


@courses_router.get(
	'/stats',
	summary='Список курсов с количеством записей',
	response_model=list[schema.CourseStats],
)
def get_courses_stats(
	session: SessionDatabase,
):
	return courses_service.get_stats(session=session)


@courses_router.get(
	'/{id}',
	summary='Курс с количеством записей',
	response_model=schema.CourseStats,
	responses={
		status.HTTP_404_NOT_FOUND: {'description': 'Курс не найден'},
	},
)
def get_course(
	session: SessionDatabase,
	id: str = Path(..., title='Идентификатор курса'),
):
	course = courses_service.get_stats_by_id(session=session, id=id)

	if not course:
		raise NotFoundHTTPException(detail='Курс не найден')

	return course
