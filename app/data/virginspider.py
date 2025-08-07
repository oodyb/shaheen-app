from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Setup Selenium WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# List of target URLs
urls = [
    "https://www.virginmegastore.qa/en/electronics-accessories/c/n010301",
    "https://www.virginmegastore.qa/en/c/n010000"
]

all_products = []  # Store all products from all URLs

# Function to clean and format price
def format_price(price_text):
    try:
        return int(float(price_text.replace(",", "").split()[0]))  # Convert to integer
    except ValueError:
        return None  # Return None if conversion fails

for url in urls:
    driver.get(url)
    time.sleep(3)  # Allow time for page load

    while True:
        print(f"Scraping page: {driver.current_url}")

        # Find all product items
        products = driver.find_elements(By.CSS_SELECTOR, "li.product-list__item")

        for product in products:
            try:
                name = product.find_element(By.CSS_SELECTOR, "a.product-list__name").text.strip()
                link = product.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                price_text = product.find_element(By.CSS_SELECTOR, "div.price__value .price__number").text.strip()
                currency = product.find_element(By.CSS_SELECTOR, "div.price__value .price__currency").text.strip()
                position = product.get_attribute("data-position")
                brand = product.find_element(By.CSS_SELECTOR, "div.product-list__brand span").text.strip()
                image_url = product.find_element(By.CSS_SELECTOR, "a.product-list__thumb img").get_attribute("src")
                
                price = format_price(price_text)  # Convert price to integer

                all_products.append({
                    "name": name,
                    "link": link,
                    "price": price,  # Now an integer
                    "currency": currency,
                    "position": position,
                    "brand": brand,
                    "image_url": image_url
                })
            except Exception as e:
                print(f"Skipping product due to error: {e}")

        # Try to find and click the "Next" button for pagination
        try:
            next_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "li.pagination__item--next a.pagination__link"))
            )
            next_button.click()
            time.sleep(2)  # Allow next page to load
        except:
            print("No more pages found.")
            break  # Exit loop if no more pages

# Save all collected data to JSON
with open("virgindata.json", "w", encoding="utf-8") as f:
    json.dump(all_products, f, indent=4, ensure_ascii=False)

print(f"Scraped {len(all_products)} products and saved to virgindata.json")

# Close the browser
driver.quit()
