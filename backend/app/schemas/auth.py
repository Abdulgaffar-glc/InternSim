from pydantic import BaseModel, EmailStr

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
