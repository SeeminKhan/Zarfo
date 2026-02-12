import streamlit as st
import requests
import time
from datetime import datetime, time as dt_time

st.set_page_config(page_title="Zarfo – Decision Engine", layout="centered")
st.title("Zarfo – Smart Food Decision Engine")

API_URL = "http://127.0.0.1:8000/predict"

with st.form("food_form"):
    st.subheader("Initial Food Listing")
    col1, col2 = st.columns(2)
    with col1:
        food_name = st.text_input("Food Name", value="Veg Biryani")
        category = st.selectbox("Category", ["Veg", "Non-Veg", "Sweet", "Snack", "Other"])
        prep_date = st.date_input("Preparation Date")
        prep_time = st.time_input("Preparation Time", value=dt_time(12, 0))
    with col2:
        expiry_date = st.date_input("Expiry Date")
        expiry_time = st.time_input("Expiry Time", value=dt_time(22, 0))
        quantity = st.number_input("Quantity", min_value=1, value=10)
        actual_price = st.number_input("Actual Price (₹)", min_value=0.0, value=150.0)
    
    submitted = st.form_submit_button("List Item & Start Agent")

if submitted:
    # 1. Initial Call to API
    payload = {
        "FoodName": food_name, "Category": category,
        "PrepDate": str(prep_date), "PrepTime": prep_time.strftime("%H:%M"),
        "ExpiryDate": str(expiry_date), "ExpiryTime": expiry_time.strftime("%H:%M"),
        "Quantity": int(quantity), "Price": actual_price
    }
    
    response = requests.post(API_URL, json=payload).json()
    
    if "error" in response:
        st.error(response["error"])
    else:
        st.success(f"Item Listed! Current Status: {response['decision']}")
        
        # 2. Start Simulation Loop (Calling API every 'hour')
        st.divider()
        st.subheader("Agent Monitoring Simulation")
        t_metric, s_metric, p_metric = st.columns(3)
        t_val = t_metric.empty()
        s_val = s_metric.empty()
        p_val = p_metric.empty()
        
        log = st.container()
        last_p = actual_price
        
        # Calculate total hours for simulation loop
        prep_dt = datetime.combine(prep_date, prep_time)
        exp_dt = datetime.combine(expiry_date, expiry_time)
        total_h = int((exp_dt - prep_dt).total_seconds() / 3600)

        for h in range(0, total_h + 1):
            sim_time_left = total_h - h
            
            # Use simulated time for prediction
            sim_payload = payload.copy()
            sim_payload["SimulatedTimeLeft"] = sim_time_left
            
            try:
                res = requests.post(API_URL, json=sim_payload).json()
            except Exception as e:
                st.error(f"API Error at hour {h}: {e}")
                break

            t_val.metric("Time Left", f"{sim_time_left}h")
            s_val.metric("Status", res["decision"])
            p_val.metric("Price", f"₹{res['suggested_price']}")
            
            if res["decision"] == "SELL":
                log.text(f"Hour {h}: [AGENT] Price adjusted to ₹{res['suggested_price']}")
                last_p = res["suggested_price"]
            else:
                log.error(f"Hour {h}: [AGENT] Switch to DONATE. Threshold Reached.")
                break
            time.sleep(0.5)