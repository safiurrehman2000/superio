"use client";

import React, { useState, useEffect } from "react";

const FAQDisplay = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faqs");

      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        setError("Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setError("Error fetching FAQs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredFAQs =
    selectedCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const groupedFAQs = categories.reduce((acc, category) => {
    const categoryFAQs = faqs.filter((faq) => faq.category === category.id);
    if (categoryFAQs.length > 0) {
      acc[category.id] = {
        name: category.name,
        faqs: categoryFAQs,
      };
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="faq-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading FAQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faq-container">
        <div className="no-faqs">
          <h3>Error Loading FAQs</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="faq-container">
        <div className="no-faqs">
          <h3>No FAQs Available</h3>
          <p>Check back later for frequently asked questions.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category Filter */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "12px 20px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            backgroundColor: "white",
            cursor: "pointer",
            minWidth: "200px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* FAQs by Category */}
      {selectedCategory === "all" ? (
        // Show all FAQs grouped by category
        Object.entries(groupedFAQs).map(([categoryId, categoryData]) => (
          <div key={categoryId} style={{ marginBottom: "60px" }}>
            <h3
              style={{
                color: "#202124",
                paddingBottom: "12px",
                marginBottom: "30px",
                fontSize: "26px",
                fontWeight: "500",
                lineHeight: "35px",
              }}
            >
              {categoryData.name}
            </h3>
            <ul className="accordion-box">
              {categoryData.faqs.map((faq, index) => (
                <li
                  key={faq.id}
                  className="accordion-item accordion block active-block"
                >
                  <h2 className="accordion-header">
                    <button
                      className="acc-btn accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${faq.id}`}
                      aria-expanded="false"
                      aria-controls={`collapse${faq.id}`}
                    >
                      {faq.heading}
                    </button>
                  </h2>
                  <div
                    id={`collapse${faq.id}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading${faq.id}`}
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body">
                      <div className="content">
                        {faq.content.split("\n").map((paragraph, pIndex) => (
                          <p key={pIndex}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        // Show filtered FAQs
        <ul className="accordion-box mb-0">
          {filteredFAQs.map((faq, index) => (
            <li
              key={faq.id}
              className="accordion-item accordion block active-block"
            >
              <h2 className="accordion-header">
                <button
                  className="acc-btn accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${faq.id}`}
                  aria-expanded="false"
                  aria-controls={`collapse${faq.id}`}
                >
                  {faq.heading}
                </button>
              </h2>
              <div
                id={`collapse${faq.id}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${faq.id}`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <div className="content">
                    {faq.content.split("\n").map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default FAQDisplay;
