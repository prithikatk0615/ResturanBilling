import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
    const [menu, setMenu] = useState({});
    const [orderId, setOrderId] = useState(null);
    const [order, setOrder] = useState(null);

    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const [tip, setTip] = useState("");


    useEffect(() => {
        fetch(`${API}/menu`)
            .then((res) => res.json())
            .then((data) => {
                setMenu(data);
            })
            .catch((error) => {
                console.error("Menu error:", error);
                alert("Backend is not running.");
            });
    }, []);


    async function createOrder() {
        const response = await fetch(`${API}/orders`, {
            method: "POST",
        });

        const data = await response.json();

        setOrderId(data.order_id);

        return data.order_id;
    }


    async function displayOrder(id) {
        const response = await fetch(`${API}/orders/${id}`);

        const data = await response.json();

        setOrder(data);
    }


    async function addItem(item) {
        try {
            let currentOrderId = orderId;

            if (!currentOrderId) {
                currentOrderId = await createOrder();
            }

            const response = await fetch(`${API}/orders/items`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    order_id: currentOrderId,
                    category: category,
                    item_name: item.name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to add item");
                return;
            }

            await displayOrder(currentOrderId);

        } catch (error) {
            console.error(error);
            alert("Backend connection failed.");
        }
    }


    async function deleteItem(id) {
        const confirmDelete = window.confirm(
            "Delete this item?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/orders/items/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            alert(data.message);

            await displayOrder(orderId);

        } catch (error) {
            console.error(error);
        }
    }


    async function updateItem(itemId) {
        const newName = window.prompt(
            "Enter exact new item name:"
        );

        if (!newName || newName.trim() === "") {
            return;
        }

        try {
            const response = await fetch(
                `${API}/orders/items/${itemId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        item_name: newName,
                        category: category,
                    }),
                }
            );

            const data = await response.json();

            alert(data.message);

            await displayOrder(orderId);

        } catch (error) {
            console.error(error);
        }
    }


    async function generateBill() {
        if (!orderId) {
            alert("Please add at least one item.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/orders/${orderId}/bill`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        tip: Number(tip) || 0,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            await displayOrder(orderId);

        } catch (error) {
            console.error(error);
        }
    }



    function newOrder() {
        setOrderId(null);
        setOrder(null);

        setCategory("");
        setSubCategory("");

        setTip("");
    }

    return (
        <div className="container">

            <div className="restaurant">

                <h1>
                    🍽️ Restaurant Billing
                </h1>

                <p className="orderNumber">
                    {orderId
                        ? `Order #${orderId}`
                        : "New Order"}
                </p>

                {/* ========================= */}
                {/* MAIN CATEGORIES */}
                {/* ========================= */}

                <div className="categories">

                    {Object.keys(menu).map((item) => (

                        <button
                            key={item}
                            onClick={() => {
                                setCategory(item);
                                setSubCategory("");
                            }}
                        >
                            {item}
                        </button>

                    ))}

                </div>


                {/* ========================= */}
                {/* SUB CATEGORIES */}
                {/* ========================= */}

                {category && (

                    <div className="section">

                        <h2>
                            {category} Menu
                        </h2>

                        <div className="subCategories">

                            {Object.keys(
                                menu[category]
                            ).map((item) => (

                                <button
                                    key={item}
                                    onClick={() =>
                                        setSubCategory(item)
                                    }
                                >
                                    {item}
                                </button>

                            ))}

                        </div>

                    </div>

                )}


                {/* ========================= */}
                {/* FOOD ITEMS */}
                {/* ========================= */}

                {category &&
                    subCategory && (

                        <div>

                            <h2 className="menuTitle">
                                {subCategory}
                            </h2>

                            <div className="foodGrid">

                                {menu[category][
                                    subCategory
                                ].map((item) => (

                                    <div
                                        className="foodCard"
                                        key={item.name}
                                    >

                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            ₹{item.price}
                                        </p>

                                        <button
                                            onClick={() =>
                                                addItem(item)
                                            }
                                        >
                                            Add
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}


                <hr />


                {/* ========================= */}
                {/* BILL */}
                {/* ========================= */}

                <div className="bill">

                    <h2>
                        🧾 Restaurant Bill
                    </h2>

                    {!order ||
                        order.items.length === 0 ? (

                        <p className="empty">
                            No items ordered.
                        </p>

                    ) : (

                        <>

                            {order.items.map((item) => (

                                <div
                                    className="billItem"
                                    key={item.id}
                                >

                                    <div>

                                        <strong>
                                            {item.item_name}
                                        </strong>

                                        <p>
                                            {item.category}
                                        </p>

                                    </div>

                                    <strong>
                                        ₹{item.price}
                                    </strong>

                                    <div>

                                        <button
                                            className="update"
                                            onClick={() =>
                                                updateItem(
                                                    item.id
                                                )
                                            }
                                        >
                                            Update
                                        </button>

                                        <button
                                            className="delete"
                                            onClick={() =>
                                                deleteItem(
                                                    item.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}


                            <div className="billTotal">

                                <h3>
                                    Food Bill:
                                    ₹{order.food_total}
                                </h3>

                                <div className="tipBox">

                                    <label>
                                        Tip Amount:
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={tip}
                                        onChange={(e) =>
                                            setTip(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter tip"
                                    />

                                </div>


                                <button
                                    className="generate"
                                    onClick={
                                        generateBill
                                    }
                                >
                                    Generate Bill
                                </button>


                                {order.status ===
                                    "COMPLETED" && (

                                    <div className="finalBill">

                                        <p>
                                            Food Bill:
                                            ₹
                                            {order.food_total}
                                        </p>

                                        <p>
                                            Tip:
                                            ₹{order.tip}
                                        </p>

                                        <h2>
                                            Final Bill:
                                            ₹
                                            {order.final_total}
                                        </h2>

                                        <h3>
                                            Thank You!
                                            Visit Again ❤️
                                        </h3>

                                    </div>

                                )}

                            </div>

                        </>

                    )}

                </div>


                {/* ========================= */}
                {/* NEW ORDER */}
                {/* ========================= */}

                <button
                    className="newOrder"
                    onClick={newOrder}
                >
                    New Order
                </button>

            </div>

        </div>
    );
}

export default App;