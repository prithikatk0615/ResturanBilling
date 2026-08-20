from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
from models import Order, OrderItem
from schemas import ItemCreate, ItemUpdate, BillCreate
from menu import MENU

Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/menu")
def get_menu():

    return MENU

@app.post("/orders")
def create_order():

    db = SessionLocal()

    order = Order(
        tip=0,
        food_total=0,
        final_total=0,
        status="OPEN"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    order_id = order.id

    db.close()

    return {
        "message": "Order created successfully",
        "order_id": order_id
    }


@app.post("/orders/items")
def add_item(item: ItemCreate):

    db = SessionLocal()

    order = db.query(Order).filter(
        Order.id == item.order_id
    ).first()

    if order is None:
        db.close()

        return {
            "message": "Order not found"
        }

    price = None

    for category_data in MENU.values():

        for items in category_data.values():

            for menu_item in items:

                if menu_item["name"] == item.item_name:
                    price = menu_item["price"]

                    break

            if price is not None:
                break

        if price is not None:
            break

    if price is None:

        db.close()

        return {
            "message": "Invalid menu item"
        }

    new_item = OrderItem(
        order_id=item.order_id,
        category=item.category,
        item_name=item.item_name,
        price=price
    )

    db.add(new_item)

    db.commit()


    items = db.query(OrderItem).filter(
        OrderItem.order_id == item.order_id
    ).all()

    total = sum(i.price for i in items)

    order.food_total = total
    order.final_total = total + order.tip

    db.commit()

    db.close()

    return {
        "message": f"{item.item_name} added successfully",
        "price": price
    }


@app.get("/orders/{order_id}")
def get_order(order_id: int):

    db = SessionLocal()

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if order is None:
        db.close()

        return {
            "message": "Order not found"
        }

    items = db.query(OrderItem).filter(
        OrderItem.order_id == order_id
    ).all()

    result = {

        "order_id": order.id,

        "items": [
            {
                "id": item.id,
                "category": item.category,
                "item_name": item.item_name,
                "price": item.price
            }

            for item in items
        ],

        "food_total": order.food_total,

        "tip": order.tip,

        "final_total": order.final_total,

        "status": order.status
    }

    db.close()

    return result


@app.put("/orders/items/{item_id}")
def update_item(
    item_id: int,
    item: ItemUpdate
):

    db = SessionLocal()

    existing_item = db.query(OrderItem).filter(
        OrderItem.id == item_id
    ).first()

    if existing_item is None:

        db.close()

        return {
            "message": "Item not found"
        }

    price = None

    for category_data in MENU.values():

        for items in category_data.values():

            for menu_item in items:

                if menu_item["name"] == item.item_name:

                    price = menu_item["price"]

                    break

            if price is not None:
                break

        if price is not None:
            break

    if price is None:

        db.close()

        return {
            "message": "Invalid menu item"
        }

    existing_item.item_name = item.item_name
    existing_item.category = item.category
    existing_item.price = price

    db.commit()

    order = db.query(Order).filter(
        Order.id == existing_item.order_id
    ).first()

    items = db.query(OrderItem).filter(
        OrderItem.order_id == existing_item.order_id
    ).all()

    total = sum(i.price for i in items)

    order.food_total = total
    order.final_total = total + order.tip

    db.commit()

    db.close()

    return {
        "message": "Item updated successfully"
    }


@app.delete("/orders/items/{item_id}")
def delete_item(item_id: int):

    db = SessionLocal()

    existing_item = db.query(OrderItem).filter(
        OrderItem.id == item_id
    ).first()

    if existing_item is None:

        db.close()

        return {
            "message": "Item not found"
        }

    order_id = existing_item.order_id

    db.delete(existing_item)

    db.commit()

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    items = db.query(OrderItem).filter(
        OrderItem.order_id == order_id
    ).all()

    total = sum(i.price for i in items)

    order.food_total = total
    order.final_total = total + order.tip

    db.commit()

    db.close()

    return {
        "message": "Item deleted successfully"
    }


@app.post("/orders/{order_id}/bill")
def generate_bill(
    order_id: int,
    bill: BillCreate
):

    db = SessionLocal()

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if order is None:

        db.close()

        return {
            "message": "Order not found"
        }

    order.tip = bill.tip

    order.final_total = (
        order.food_total + bill.tip
    )

    order.status = "COMPLETED"

    db.commit()

    result = {

        "order_id": order.id,

        "food_total": order.food_total,

        "tip": order.tip,

        "final_total": order.final_total,

        "status": order.status
    }

    db.close()

    return result