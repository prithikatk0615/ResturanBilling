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

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [newItemName, setNewItemName] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API}/menu`)
            .then((res) => res.json())
            .then((data) => {
                setMenu(data);

                const firstCategory = Object.keys(data)[0];

                if (firstCategory) {
                    setCategory(firstCategory);

                    const firstSubCategory =
                        Object.keys(data[firstCategory])[0];

                    if (firstSubCategory) {
                        setSubCategory(firstSubCategory);
                    }
                }
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
            setLoading(true);

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
        } finally {
            setLoading(false);
        }
    }

    async function deleteItem() {
        if (!selectedItem) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/orders/items/${selectedItem.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to delete item");
                return;
            }

            setShowDeleteModal(false);
            setSelectedItem(null);

            await displayOrder(orderId);
        } catch (error) {
            console.error(error);
            alert("Unable to delete item.");
        }
    }

    function openUpdateModal(item) {
        setSelectedItem(item);
        setNewItemName(item.item_name);
        setShowUpdateModal(true);
    }

    function openDeleteModal(item) {
        setSelectedItem(item);
        setShowDeleteModal(true);
    }

    async function updateItem() {
        if (!selectedItem || !newItemName.trim()) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/orders/items/${selectedItem.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        item_name: newItemName.trim(),
                        category: category,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update item");
                return;
            }

            setShowUpdateModal(false);
            setSelectedItem(null);
            setNewItemName("");

            await displayOrder(orderId);
        } catch (error) {
            console.error(error);
            alert("Unable to update item.");
        }
    }

    async function generateBill() {
        if (!orderId) {
            alert("Please add at least one item.");
            return;
        }

        try {
            setLoading(true);

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
                alert(data.message || "Unable to generate bill");
                return;
            }

            console.log("Bill generated:", data);

            await displayOrder(orderId);
        } catch (error) {
            console.error(error);
            alert("Unable to generate bill.");
        } finally {
            setLoading(false);
        }
    }

    function newOrder() {
        setOrderId(null);
        setOrder(null);

        setTip("");

        setShowUpdateModal(false);
        setShowDeleteModal(false);
        setSelectedItem(null);

        const firstCategory = Object.keys(menu)[0];

        if (firstCategory) {
            setCategory(firstCategory);

            const firstSubCategory =
                Object.keys(menu[firstCategory])[0];

            setSubCategory(firstSubCategory || "");
        }
    }

    function getCategoryIcon(name) {
        const value = name.toLowerCase();

        if (
            value.includes("starter") ||
            value.includes("snack")
        ) {
            return "🥗";
        }

        if (
            value.includes("main") ||
            value.includes("food")
        ) {
            return "🍛";
        }

        if (
            value.includes("drink") ||
            value.includes("beverage")
        ) {
            return "🥤";
        }

        if (
            value.includes("dessert") ||
            value.includes("sweet")
        ) {
            return "🍰";
        }

        if (value.includes("pizza")) {
            return "🍕";
        }

        if (value.includes("burger")) {
            return "🍔";
        }

        return "🍽️";
    }

    const currentItems =
        category && subCategory
            ? menu[category]?.[subCategory] || []
            : [];

    const orderItems = order?.items || [];

    return (
        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="brand">
                    <div className="brandIcon">
                        🍽️
                    </div>

                    <div>
                        <h2>Foodora</h2>
                        <span>Restaurant POS</span>
                    </div>
                </div>

                <div className="sidebarTitle">
                    MENU
                </div>

                <div className="sidebarCategories">
                    {Object.keys(menu).map((item) => (
                        <button
                            key={item}
                            className={
                                category === item
                                    ? "sideCategory active"
                                    : "sideCategory"
                            }
                            onClick={() => {
                                setCategory(item);

                                const firstSubCategory =
                                    Object.keys(menu[item])[0];

                                setSubCategory(
                                    firstSubCategory || ""
                                );
                            }}
                        >
                            <span>
                                {getCategoryIcon(item)}
                            </span>

                            <span>
                                {item}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="sidebarBottom">
                    <div className="restaurantStatus">
                        <span className="statusDot"></span>

                        <div>
                            <strong>Restaurant Open</strong>
                            <small>
                                Ready to accept orders
                            </small>
                        </div>
                    </div>
                </div>

            </aside>

            {/* MAIN AREA */}

            <main className="main">

                {/* HEADER */}

                <header className="topbar">

                    <div>
                        <p className="welcome">
                            Welcome back 👋
                        </p>

                        <h1>
                            Restaurant Billing
                        </h1>
                    </div>

                    <div className="topbarRight">

                        <div className="orderBadge">
                            <span>ORDER</span>

                            <strong>
                                {orderId
                                    ? `#${orderId}`
                                    : "NEW"}
                            </strong>
                        </div>

                        <button
                            className="newOrderTop"
                            onClick={newOrder}
                        >
                            + New Order
                        </button>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="content">

                    {/* MENU */}

                    <section className="menuSection">

                        <div className="sectionHeader">

                            <div>
                                <span className="smallTitle">
                                    EXPLORE
                                </span>

                                <h2>
                                    {category || "Menu"}
                                </h2>
                            </div>

                        </div>

                        {/* SUB CATEGORIES */}

                        {category && (
                            <div className="subCategoryBar">

                                {Object.keys(
                                    menu[category] || {}
                                ).map((item) => (

                                    <button
                                        key={item}
                                        className={
                                            subCategory === item
                                                ? "subCategory active"
                                                : "subCategory"
                                        }
                                        onClick={() =>
                                            setSubCategory(item)
                                        }
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>
                        )}

                        {/* FOOD CARDS */}

                        <div className="foodGrid">

                            {currentItems.map((item) => (

                                <div
                                    className="foodCard"
                                    key={item.name}
                                >

                                    <div className="foodImage">
                                        {getCategoryIcon(
                                            item.name
                                        )}
                                    </div>

                                    <div className="foodInfo">

                                        <span className="foodCategory">
                                            {subCategory}
                                        </span>

                                        <h3>
                                            {item.name}
                                        </h3>

                                        <div className="foodBottom">

                                            <strong>
                                                ₹{item.price}
                                            </strong>

                                            <button
                                                className="addButton"
                                                onClick={() =>
                                                    addItem(item)
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                    {/* ORDER PANEL */}

                    <aside className="orderPanel">

                        <div className="orderHeader">

                            <div>
                                <span>
                                    CURRENT ORDER
                                </span>

                                <h2>
                                    Order #
                                    {orderId || "NEW"}
                                </h2>
                            </div>

                            <div className="cartIcon">
                                🛒
                            </div>

                        </div>

                        <div className="orderItems">

                            {orderItems.length === 0 ? (

                                <div className="emptyCart">

                                    <div className="emptyCartIcon">
                                        🛒
                                    </div>

                                    <h3>
                                        Your order is empty
                                    </h3>

                                    <p>
                                        Select food from the menu
                                        to add items.
                                    </p>

                                </div>

                            ) : (

                                orderItems.map((item) => (

                                    <div
                                        className="orderItem"
                                        key={item.id}
                                    >

                                        <div className="orderItemIcon">
                                            {getCategoryIcon(
                                                item.item_name
                                            )}
                                        </div>

                                        <div className="orderItemDetails">

                                            <strong>
                                                {item.item_name}
                                            </strong>

                                            <span>
                                                {item.category}
                                            </span>

                                            <b>
                                                ₹{item.price}
                                            </b>

                                        </div>

                                        <div className="itemActions">

                                            <button
                                                className="editBtn"
                                                onClick={() =>
                                                    openUpdateModal(
                                                        item
                                                    )
                                                }
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className="removeBtn"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        item
                                                    )
                                                }
                                            >
                                                🗑️
                                            </button>

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                        {/* BILL SUMMARY */}

                        {orderItems.length > 0 && (

                            <div className="billSummary">

                                <div className="summaryRow">

                                    <span>
                                        Items
                                    </span>

                                    <strong>
                                        {orderItems.length}
                                    </strong>

                                </div>

                                <div className="summaryRow">

                                    <span>
                                        Food Total
                                    </span>

                                    <strong>
                                        ₹{order?.food_total || 0}
                                    </strong>

                                </div>

                                <div className="tipInput">

                                    <label>
                                        Tip
                                    </label>

                                    <div className="tipInputBox">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={tip}
                                            onChange={(e) =>
                                                setTip(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                </div>

                                <div className="totalRow">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ₹
                                        {(
                                            Number(
                                                order?.food_total || 0
                                            ) +
                                            Number(tip || 0)
                                        ).toFixed(2)}
                                    </strong>

                                </div>

                                <button
                                    className="generateButton"
                                    onClick={generateBill}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Processing..."
                                        : "Generate Bill →"}
                                </button>

                            </div>

                        )}

                    </aside>

                </div>

                {/* COMPLETED RECEIPT */}

                {order?.status === "COMPLETED" && (

                    <div className="receipt">

                        <div className="receiptTop">

                            <span className="receiptIcon">
                                ✓
                            </span>

                            <h2>
                                Payment Completed
                            </h2>

                            <p>
                                Thank you for dining with us!
                            </p>

                        </div>

                        <div className="receiptDetails">

                            <div>
                                <span>
                                    Order
                                </span>

                                <strong>
                                    #{orderId}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Food
                                </span>

                                <strong>
                                    ₹{order.food_total}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Tip
                                </span>

                                <strong>
                                    ₹{order.tip}
                                </strong>
                            </div>

                        </div>

                        <div className="receiptTotal">

                            <span>
                                Final Bill
                            </span>

                            <strong>
                                ₹{order.final_total}
                            </strong>

                        </div>

                        <button
                            className="receiptNewOrder"
                            onClick={newOrder}
                        >
                            Start New Order
                        </button>

                    </div>

                )}

            </main>

            {/* UPDATE MODAL */}

            {showUpdateModal && (

                <div className="modalOverlay">

                    <div className="modal">

                        <div className="modalIcon">
                            ✏️
                        </div>

                        <h2>
                            Update Item
                        </h2>

                        <p>
                            Enter the exact new item name.
                        </p>

                        <input
                            className="modalInput"
                            value={newItemName}
                            onChange={(e) =>
                                setNewItemName(
                                    e.target.value
                                )
                            }
                            autoFocus
                        />

                        <div className="modalButtons">

                            <button
                                className="cancelButton"
                                onClick={() =>
                                    setShowUpdateModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmButton"
                                onClick={updateItem}
                            >
                                Update Item
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* DELETE MODAL */}

            {showDeleteModal && (

                <div className="modalOverlay">

                    <div className="modal">

                        <div className="deleteModalIcon">
                            🗑️
                        </div>

                        <h2>
                            Remove Item?
                        </h2>

                        <p>
                            Are you sure you want to remove
                            <strong>
                                {" "}
                                {selectedItem?.item_name}
                            </strong>
                            ?
                        </p>

                        <div className="modalButtons">

                            <button
                                className="cancelButton"
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="deleteConfirmButton"
                                onClick={deleteItem}
                            >
                                Remove Item
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default App;