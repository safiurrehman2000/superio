"use client";

import { setSelectedCategory } from "@/features/job/newJobSlice";
import { useDispatch, useSelector } from "react-redux";

const Categories = () => {
  const dispatch = useDispatch();
  const selectedCategory = useSelector(
    (state) => state?.newJob?.selectedCategory
  );
  return (
    <>
      <select
        className="form-select"
        value={selectedCategory}
        onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
      >
        <option value="">Choose a category</option>
        <option value="residential">Residential</option>
        <option value="commercial">Commercial</option>
        <option value="industrial">Industrial</option>
        <option value="apartments">Apartments</option>
        <option value="funeral-sector">Funeral sector</option>
        <option value="moving-sector">Moving sector</option>
        <option value="power-supply">Power supply</option>
        <option value="department-stores">Department stores</option>
        <option value="independent-retail">Independent retail</option>
        <option value="automotive-sector">Automotive sector</option>
        <option value="bakeries">Bakeries</option>
        <option value="cinemas">Cinemas</option>
        <option value="buses-and-coaches">Buses and coaches</option>
        <option value="entertainment">Entertainment</option>
        <option value="event-sector">Event Sector</option>
        <option value="fashion-clothing">Fashion/Clothing</option>
        <option value="food-products">Trade in Food Products</option>
        <option value="hotel-sector">Hotel Sector</option>
        <option value="real-estate-sector">Real Estate Sector</option>
        <option value="childcare">Childcare</option>
        <option value="food-retail-trade">Food Retail Trade</option>
        <option value="agriculture-and-horticulture">
          Agriculture and Horticulture
        </option>
        <option value="medium-sized-food-companies">
          Medium Sized Food Companies
        </option>
        <option value="education">Education</option>
        <option value="driving-schools">Driving Schools</option>
        <option value="sport">Sport</option>
        <option value="sports-and-culture-in-the-flemish-community">
          Sports and Culture in the Flemish Community
        </option>
      </select>
      <span className="icon flaticon-briefcase"></span>
    </>
  );
};

export default Categories;
