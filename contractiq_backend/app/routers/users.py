# # from fastapi import APIRouter, Depends,status
# # from sqlalchemy.orm import Session

# # from app.database.database import get_db
# # from app.models.user import User
# # from app.schemas.user import UserCreate, UserResponse

# # router = APIRouter(
# #     prefix="/users",
# #     tags=["Users"]
# # )

# # @router.post(
# #     "/",
# #     response_model=UserResponse,
# #     status_code=201
# # )
# # def create_user(
# #     user_data: UserCreate,
# #     db: Session = Depends(get_db)
# # ):
# #     user = User(
# #         full_name=user_data.full_name,
# #         email=user_data.email,
# #         role=user_data.role
# #     )

# #     db.add(user)
# #     db.commit()
# #     db.refresh(user)

# #     return user

# # @router.get(
# #     "/",
# #     response_model=list[UserResponse],
# #     status_code=status.HTTP_200_OK
# # )
# # def get_users(db: Session = Depends(get_db)):
# #     users = db.query(User).all()
# #     return users


# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.database.database import get_db
# from app.models.user import User
# from app.core.dependencies import require_role
# from app.core.roles import UserRole
# from app.schemas.user import UserCreate, UserUpdate, UserResponse
# from app.utils.security import hash_password
# from app.schemas.user import UserCreate, UserUpdate, UserResponse, PasswordUpdate

# router = APIRouter(
#     prefix="/users",
#     tags=["Users"]
# )


# # Create User
# @router.post(
#     "/",
#     response_model=UserResponse,
#     status_code=status.HTTP_201_CREATED
# )
# def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
#     user = User(
#         full_name=user_data.full_name,
#         email=user_data.email,
#         role=user_data.role,
#         password_hash=hash_password(user_data.password)
#     )

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     return user


# # Get All Users
# @router.get(
#     "/",
#     response_model=list[UserResponse]
# )
# def get_users(db: Session = Depends(get_db)):
#     return db.query(User).all()


# # Get User By ID
# @router.get(
#     "/{user_id}",
#     response_model=UserResponse
# )
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()

#     if user is None:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )

#     return user


# # Update User
# @router.put(
#     "/{user_id}",
#     response_model=UserResponse
# )
# def update_user(
#     user_id: int,
#     user_data: UserUpdate,
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.id == user_id).first()

#     if user is None:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )

#     user.full_name = user_data.full_name
#     user.email = user_data.email
#     user.role = user_data.role
#     user.password_hash = hash_password(user_data.password)
#     user.is_active = user_data.is_active

#     db.commit()
#     db.refresh(user)

#     return user


# @router.patch("/{user_id}/password", response_model=UserResponse)
# def update_password(
#     user_id: int,
#     password_data: PasswordUpdate,
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.id == user_id).first()

#     if user is None:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )

#     user.password_hash = hash_password(password_data.password)

#     db.commit()
#     db.refresh(user)

#     return user

# # Delete User
# @router.delete("/{user_id}")
# def delete_user(
#     user_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(
#         require_role(UserRole.ADMINISTRATOR.value)
#     )
# ):
#     user = db.query(User).filter(User.id == user_id).first()

#     if user is None:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )

#     db.delete(user)
#     db.commit()

#     return {
#         "message": "User deleted successfully"
#     }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.core.dependencies import require_role
from app.core.roles import UserRole
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    PasswordUpdate
)
from app.utils.security import hash_password
from app.services.audit_service import log_audit_event


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================
# CREATE USER
# ADMINISTRATOR ONLY
# =========================

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        role=user_data.role,
        password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="USER_CREATED",
        entity_name="User",
        entity_id=user.id,
        after_data=f"Created user {user.full_name} ({user.email}) with role {user.role}"
    )

    return user


# =========================
# GET ALL USERS
# ADMINISTRATOR ONLY
# =========================

@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    return db.query(User).all()


# =========================
# GET SINGLE USER
# ADMINISTRATOR ONLY
# =========================

@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =========================
# UPDATE USER
# ADMINISTRATOR ONLY
# =========================

@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.full_name = user_data.full_name
    user.email = user_data.email
    user.role = user_data.role
    user.password_hash = hash_password(
        user_data.password
    )
    user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)

    return user


# =========================
# UPDATE PASSWORD
# ADMINISTRATOR ONLY
# =========================

@router.patch(
    "/{user_id}/password",
    response_model=UserResponse
)
def update_password(
    user_id: int,
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password_hash = hash_password(
        password_data.password
    )

    db.commit()
    db.refresh(user)

    return user


# =========================
# DELETE USER
# ADMINISTRATOR ONLY
# =========================

@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMINISTRATOR.value)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }