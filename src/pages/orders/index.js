import { Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import {
  currencyFormatter,
  errorHandler,
  setHeaders,
  toastMessage,
} from "../../helpers";
import { Grid } from "@mui/material";
import Loader from "../loader";
import { fetchOrders } from "../../actions/orders";

const Orders = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const { orders, isLoading } = useSelector((state) => state.orders);
  const [successTotal, setSuccessTotal] = useState(0);
  const [failedTotat, setFailedTotal] = useState(0);
  const [ordersToShow, setOrdersToshow] = useState([]);

  //
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  //

  useEffect(() => {
    dispatch(fetchOrders());
  }, []);

  useEffect(() => {
    let sub = true;
    if (sub) {
      const success = ordersToShow.filter(
        (item) => item.paymentStatus === "SUCCESS"
      );
      const failed = ordersToShow.filter(
        (item) => item.paymentStatus === "FAILED"
      );

      let s1 = 0;
      let s2 = 0;
      for (let i = 0; i < success.length; i++) {
        s1 +=
          Number(success[i].cartTotalAmount) + Number(success[i].deliveryFees);
        // +
        // Number(success[i].systemFees) +
        // Number(success[i].packagingFees) +
        // Number(success[i].agentFees);
      }

      for (let i = 0; i < failed.length; i++) {
        s2 +=
          Number(failed[i].cartTotalAmount) + Number(failed[i].deliveryFees);
        // +
        // Number(failed[i].systemFees) +
        // Number(failed[i].packagingFees) +
        // Number(failed[i].agentFees);
      }
      setSuccessTotal(s1);
      setFailedTotal(s2);
    }
    return () => {
      sub = false;
    };
  }, [ordersToShow]);

  useEffect(() => {
    let sub = true;
    if (sub) {
      let res = orders;
      // if (keyWord.trim() !== "") {
      //   res = allPcList.filter(
      //     (item) =>
      //       item.serialNumber.toLowerCase().includes(keyWord.toLowerCase()) ||
      //       item.model.toLowerCase().includes(keyWord.toLowerCase())
      //   );
      // }
      if (paymentStatusFilter !== "") {
        res = res.filter((item) => item.paymentStatus === paymentStatusFilter);
      }
      if (deliveryStatusFilter !== "") {
        res = res.filter(
          (item) => item.deliveryStatus === deliveryStatusFilter
        );
      }

      if (dateFilter !== "") {
        res = res.filter(
          (item) =>
            new Date(item.createdAt).toLocaleDateString() ===
            new Date(dateFilter).toLocaleDateString()
        );
      }
      setOrdersToshow(res);
    }
    return () => {
      sub = false;
    };
  }, [paymentStatusFilter, deliveryStatusFilter, dateFilter, orders]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={12}>
          <Card>
            <Card.Header>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <strong>Orders List ({orders.length})</strong>
                <div>
                  <table>
                    <tr>
                      <td>
                        <select
                          value={deliveryStatusFilter}
                          onChange={(e) =>
                            setDeliveryStatusFilter(e.target.value)
                          }
                        >
                          <option value="">Delivery Status</option>
                          <option value="PENDING">PENDING</option>
                          <option value="WAITING">WAITING</option>
                          <option value="FAILED">FAILED</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={paymentStatusFilter}
                          onChange={(e) =>
                            setPaymentStatusFilter(e.target.value)
                          }
                        >
                          <option value="">Payment Status</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="FAILED">FAILED</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <Loader />
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>OrderId</th>
                        <th>Market</th>
                        <th>Products</th>
                        <th>Subtotal</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Delivery</th>
                        <th>System Fees</th>
                        <th>Packaging Fees</th>
                        <th>Client</th>
                        <th>Agent</th>
                        <th>Rider</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersToShow.map((item, index) => (
                        <tr>
                          <td>{item.id}</td>
                          <td>Market</td>
                          <td>Products</td>
                          <td>{currencyFormatter(item.cartTotalAmount)} RWF</td>
                          <td>
                            {currencyFormatter(
                              Number(item.cartTotalAmount) +
                                Number(item.deliveryFees) +
                                Number(item.systemFees) +
                                Number(item.packagingFees) +
                                Number(item.agentFees)
                            )}{" "}
                            RWF
                          </td>
                          <td>
                            <p
                              style={{ margin: 0 }}
                              className={
                                item.paymentStatus === "FAILED"
                                  ? "text-danger"
                                  : item.paymentStatus === "PENDING"
                                  ? "text-info"
                                  : "text-primary"
                              }
                            >
                              {item.paymentStatus}
                            </p>
                            <p style={{ margin: 0 }}>
                              Method: {item.paymentMethod}
                            </p>
                            <p style={{ margin: 0 }}>
                              Phone: {item.paymentPhoneNumber}
                            </p>
                          </td>
                          <td>
                            <p style={{ margin: 0 }}>{item.deliveryStatus}</p>
                            <p style={{ margin: 0, fontWeight: "bold" }}>
                              Address:
                            </p>
                            <p style={{ margin: 0 }}>
                              {item.deliveryAddress.name}
                            </p>
                            <p style={{ margin: 0, fontWeight: "bold" }}>
                              Delivery Fees:
                            </p>
                            <p style={{ margin: 0 }}>
                              {currencyFormatter(item.deliveryFees)} RWF
                            </p>
                          </td>
                          <td>{currencyFormatter(item.systemFees)} RWF</td>
                          <td>{currencyFormatter(item.packagingFees)} RWF</td>
                          <td>
                            <p style={{ margin: 0 }}>{item.client?.names}</p>
                            <p style={{ margin: 0 }}>
                              Email: {item.client?.email}
                            </p>
                            <p style={{ margin: 0 }}>
                              Phone: {item.client?.phone}
                            </p>
                          </td>
                          <td>
                            <p style={{ margin: 0 }}>{item.agent?.names}</p>
                            <p style={{ margin: 0 }}>
                              Email: {item.agent?.email}
                            </p>
                            <p style={{ margin: 0 }}>
                              Phone: {item.agent?.phone}
                            </p>
                          </td>
                          <td>
                            <p style={{ margin: 0 }}>{item.rider?.names}</p>
                            <p style={{ margin: 0 }}>
                              Email: {item.rider?.email}
                            </p>
                            <p style={{ margin: 0 }}>
                              Phone: {item.rider?.phone}
                            </p>
                          </td>
                          <td>{new Date(item.createdAt).toUTCString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-success">
                    <b>Total success orders: </b>{" "}
                    {currencyFormatter(successTotal)} RWF
                  </p>
                  <p className="text-danger">
                    <b>Total failed orders: </b>{" "}
                    {currencyFormatter(failedTotat)} RWF
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Orders;
