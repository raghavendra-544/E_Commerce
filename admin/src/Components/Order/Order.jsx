import { useState, useEffect } from "react";
import "./Order.css"; // Ensure CSS file is linked
import packageOrderImage from "../../assets/package_order.svg"; // Default order image

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:3000/admin/orders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: Unable to fetch orders.`);
            }

            const data = await response.json();
            setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order._id === orderId ? { ...order, status: newStatus } : order
            )
        );
    
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update order. Status: ${response.status}`);
            }
    
            const updatedOrder = await response.json();
    
            // Ensure the order is updated correctly in case of server-side changes
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === updatedOrder._id
                        ? { ...order, status: updatedOrder.status }
                        : order
                )
            );
        } catch (error) {
            console.error("Error updating order status:", error);
            setError("Failed to update order status.");
        }
    };
    

    const deleteOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/orders/${orderId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete order. Status: ${response.status}`);
            }

            setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
        } catch (error) {
            console.error("Error deleting order:", error);
            setError("Failed to delete order.");
        }
    };

    return (
        <div className="admin-orders-container">
            <h2>Manage Orders</h2>
            {loading ? (
                <p>Loading orders...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div>
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <h3>Order Id: {order._id}</h3>
                                <h3>Order Date: {new Date(order.orderDate).toLocaleString()}</h3>
                                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery || "5-7 business days"}</p>
                                <p><strong>Status:</strong>
                                    <select
                                        value={order.status || "Pending"}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </p>
                                <p><strong>Total Cost:</strong> ₹{order.totalCost}</p>
                            </div>

                            <h4>Delivery Information</h4>
                            <p><strong>Name:</strong> {order.deliveryInfo?.firstName || ""} {order.deliveryInfo?.lastName || ""}</p>
                            <p><strong>Email:</strong> {order.deliveryInfo?.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {order.deliveryInfo?.phone || "N/A"}</p>
                            <p><strong>Address:</strong> {order.deliveryInfo?.address || ""}, {order.deliveryInfo?.city || ""}, {order.deliveryInfo?.postalCode || ""}</p>

                            <h4>Items Ordered:</h4>
                            <div className="order-items-container">
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img src={item.image || packageOrderImage} 
                                                 alt={item.name || "Package Image"} 
                                                 className="order-item-image"
                                                 onError={(e) => e.target.src = packageOrderImage} 
                                            />
                                            <div className="order-item-details">
                                                <h5>{item.name}</h5>
                                                <p><strong>Quantity:</strong> {item.quantity || 1}</p>
                                                <p><strong>Payment Status: </strong>
                                                    <span className={order.paymentId ? "paid" : "unpaid"}>
                                                        {order.paymentId ? "Paid" : "Unpaid"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="delete-button" onClick={() => deleteOrder(order._id)}>
                                Delete Order
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
