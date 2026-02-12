import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck } from "lucide-react";
import api from "@/lib/api";

export default function MyRequests() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/worker/orders");
      setOrders(res.data);
      console.log("Fetched orders:", res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const pastOrders = orders.filter((o) => o.status === "Delivered");

  return (
    <div className="p-6 space-y-6">
      {/* Active Orders */}
      {activeOrders.length > 0 &&
        activeOrders.map((order) => (
          <Card key={order._id}>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{order._id}</div>
                  <div className="text-sm text-muted-foreground">
                    Placed {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <Badge variant="default">{order.status}</Badge>
              </div>
              <div className="text-sm flex items-center gap-2">
                <Truck className="w-4 h-4" /> {order.driver}
              </div>
              {order.eta && (
                <div className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> ETA: {order.eta} mins
                </div>
              )}
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  Track Live
                </Button>
                <Button variant="outline" size="sm">
                  Contact Driver
                </Button>
              </div>
            </div>
          </Card>
        ))}

      {/* Past Orders */}
      {pastOrders.length > 0 &&
        pastOrders.map((order) => (
          <Card key={order._id}>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{order._id}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.foodName} from {order.hotelName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${order.price}</div>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button variant="outline" size="sm">
                  Reorder
                </Button>
                <Button variant="outline" size="sm">
                  Rate & Review
                </Button>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}
