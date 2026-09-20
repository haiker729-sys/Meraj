package com.fashionpoint.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Order {
    private String id; // e.g. FP-10001
    private String customerName;
    private String customerMobile;
    private String customerEmail;
    private String houseShopNo;
    private String street;
    private String villageArea;
    private String city;
    private String district;
    private String state;
    private String pinCode;
    private String landmark;
    private List<OrderItem> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private String paymentMethod; // COD, ONLINE
    private String paymentStatus; // PENDING, PAID, FAILED
    private String orderStatus; // NEW, CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    private String courierName;
    private String awbNumber;
    private LocalDateTime createdAt;

    public Order() {}

    // Getters and Setters omitted for brevity but standard in JavaBeans
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
}
