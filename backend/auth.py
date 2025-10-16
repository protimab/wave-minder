from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import database

SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

#hash password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_password_hash(password: str) -> str:
    """ hash password """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """check password with its hashed ver. """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_email: str, expires_delta: Optional[timedelta] = None) -> str:
    """ create JWT access token """
    to_encode = {"sub": user_email}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> str:
    """ decode token, return email """
    try:
        # decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # "sub" -> user
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return email 
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """ get user from a JWT token """
    # verify token
    email = verify_token(token)
    # look up user
    user = database.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user #tuple

def authenticate_user(email: str, password: str):
    """ authenticate user with email and password """
    # get
    user = database.get_user_by_email(email)
    if not user:
        return False
    # check password
    if not verify_password(password, user[3]):
        return False
    return user #tuple