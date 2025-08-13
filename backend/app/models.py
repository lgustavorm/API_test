from typing import Optional

from sqlmodel import Field, SQLModel


# ========== Users ==========


class UserBase(SQLModel):
    email: str = Field(index=True)
    is_active: bool = True


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# ========== Items ==========


class ItemBase(SQLModel):
    title: str
    description: Optional[str] = None


class Item(ItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: int
    owner_id: int


class ItemUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
