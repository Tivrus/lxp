from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import schema
from app.database import models


def get_list(
	*,
	session: Session,
) -> Sequence[models.Course]:
	return session.scalars(select(models.Course)).unique().all()


def get_stats(
	*,
	session: Session,
) -> list[schema.CourseStats]:
	result = []
	for course in get_list(session=session):
		result.append(to_stats(course))
	result.sort(key=lambda c: c.title)
	return result


def get_stats_by_id(
	*,
	session: Session,
	id: str,
) -> schema.CourseStats | None:
	course = session.get(models.Course, id)
	if not course:
		return None
	return to_stats(course)


def to_stats(course: models.Course) -> schema.CourseStats:
	return schema.CourseStats(
		id=course.id,
		title=course.title,
		description=course.description,
		records_count=len(course.records),
	)
