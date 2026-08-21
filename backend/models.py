from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Order(Base):

    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    tip = Column(
        Integer,
        default=0
    )

    food_total = Column(
        Integer,
        default=0
    )

    final_total = Column(
        Integer,
        default=0
    )

    status = Column(
        String(20),
        default="OPEN"
    )


class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey(
            "orders.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    category = Column(
        String(50),
        nullable=False
    )

    item_name = Column(
        String(100),
        nullable=False
    )

    price = Column(
        Integer,
        nullable=False
    )