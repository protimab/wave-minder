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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_password_hash(password: str) -> str:
    """ hash password """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """check password with its hashed ver. """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_email: str, expires_delta: Optional[timedelta] = None) -> str:
    """ JWT access token """
    to_encode = {"sub": user_email}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> str:
    """ decode token, return email """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # "sub" -> user
        
        if email is None:
            raise credentials_exception   
        print(f"Token verified for user email: {email}")
        return email
        
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme)):
    """ get user from a JWT token """
    # verify token
    email = verify_token(token)
    # look up user
    user = database.get_user_by_email(email)
    if user is None:
        print(f"User not found in database: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    print(f"Current user authenticated: {user['name']}")
    return user #tuple

def authenticate_user(email: str, password: str):
    """ Authenticate a user with email and password """
    # get
    user = database.get_user_by_email(email)
    if not user:
        return False
    
    # check password
    if not verify_password(password, user['hashed_password']):
        print(f"Invalid password for user: {email}")
        return False
    
    print(f"User authenticated successfully: {email}")
    return user #tuple