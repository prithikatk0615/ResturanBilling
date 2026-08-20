from pydantic import BaseModel


class OrderCreate(BaseModel):
    pass


class ItemCreate(BaseModel):

    order_id: int
    category: str
    item_name: str


class ItemUpdate(BaseModel):

    item_name: str
    category: str


class BillCreate(BaseModel):

    tip: int = 0