package com.fashionpoint.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Product {
    private String id;
    private String name;
    private String category; // Men, Women, Kids
    private String subCategory; // Shirts, T-Shirts, Jeans, Dresses
    private String description;
    private List<String> images;
    private BigDecimal price;
    private BigDecimal mrp;
    private Integer discount;
    private List<String> sizes;
    private List<String> colors;
    private Integer stock;
    private String sku;
    private String status; // PUBLISHED, UNPUBLISHED
    private Boolean isFeatured;
    private Boolean isNewArrival;
    private Boolean isBestseller;
    private Double rating;
    private Integer reviewsCount;
    private LocalDateTime createdAt;

    public Product() {}

    public Product(String id, String name, String category, BigDecimal price, BigDecimal mrp, String sku) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.mrp = mrp;
        this.sku = sku;
        this.status = "PUBLISHED";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }

    public Integer getDiscount() { return discount; }
    public void setDiscount(Integer discount) { this.discount = discount; }

    public List<String> getSizes() { return sizes; }
    public void setSizes(List<String> sizes) { this.sizes = sizes; }

    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean featured) { isFeatured = featured; }

    public Boolean getIsNewArrival() { return isNewArrival; }
    public void setIsNewArrival(Boolean newArrival) { isNewArrival = newArrival; }

    public Boolean getIsBestseller() { return isBestseller; }
    public void setIsBestseller(Boolean bestseller) { isBestseller = bestseller; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
