from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    preferences = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    contracts = relationship(
        "Contract",
        foreign_keys="Contract.created_by",
        back_populates="user",
        passive_deletes=True
    )
    
    obligations = relationship(
    "Obligation",
    back_populates="user",
    passive_deletes=True
    )

    assigned_contracts = relationship(
        "Contract",
        foreign_keys="Contract.assigned_to",
        back_populates="assigned_user",
        passive_deletes=True
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        passive_deletes=True
    )

    reports = relationship(
        "Report",
        back_populates="user",
        passive_deletes=True
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        passive_deletes=True
    )

    activities = relationship(
        "Activity",
        back_populates="user",
        passive_deletes=True
    )
    renewals = relationship(
    "Renewal",
    back_populates="user",
    passive_deletes=True
    )
