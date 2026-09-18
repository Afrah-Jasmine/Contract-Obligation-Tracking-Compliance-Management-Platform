# from passlib.context import CryptContext

# pwd_context = CryptContext(
#     schemes=["bcrypt"],
#     deprecated="auto"
# )


# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)


# def verify_password(
#     plain_password: str,
#     hashed_password: str
# ) -> bool:
#     return pwd_context.verify(
#         plain_password,
#         hashed_password
#     )

import bcrypt
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# -------------------------
# Password hashing
# -------------------------

def hash_password(password: str) -> str:
    if not password:
        return ""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    if not plain_password or not hashed_password:
        return False

    # 1. First try direct native bcrypt verification
    try:
        plain_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        if bcrypt.checkpw(plain_bytes, hash_bytes):
            return True
    except Exception:
        pass

    # 2. Fallback to passlib context for legacy/alternative format hashes
    try:
        return pwd_context.verify(
            plain_password,
            hashed_password
        )
    except Exception:
        return False


# -------------------------
# JWT authentication
# -------------------------

def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        return payload

    except JWTError:
        return None