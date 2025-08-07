from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time

# Configure headless Chrome
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# List of URLs to scrape
urls = ["https://qatarmobile.qa/mobile/",
        "https://qatarmobile.qa/tablet-ipad/",
        "https://qatarmobile.qa/wearable/",
        "https://qatarmobile.qa/gaming/",
        "https://qatarmobile.qa/computer/",
        "https://qatarmobile.qa/camera/",
        "https://qatarmobile.qa/home-appliances/"]

all_products = []

def format_price(price_text):
    """ Convert price to integer, remove commas, and clean text """
    try:
        return int(float(price_text.replace("QAR", "").replace(",", "").strip()))
    except ValueError:
        return None

for url in urls:
    driver.get(url)

    # Wait for products to load
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product-item-info")))

    while True:
        print(f"Scraping: {driver.current_url}")

        # Fetch all products on the page
        products = driver.find_elements(By.CSS_SELECTOR, ".product-item-info")
        
        if not products:
            print("No products found on this page, skipping...")
            break

        for index in range(len(products)):
            try:
                # Re-fetch the product to avoid stale references
                products = driver.find_elements(By.CSS_SELECTOR, ".product-item-info")
                product = products[index]  # Access the fresh element

                name = product.find_element(By.CSS_SELECTOR, ".product-item-name a").text
                link = product.find_element(By.CSS_SELECTOR, ".product-item-name a").get_attribute("href")
                price = product.find_element(By.CSS_SELECTOR, ".price-wrapper .price").text
                image_url = product.find_element(By.CSS_SELECTOR, ".product-item-photo img").get_attribute("src")

                price = format_price(price)

                all_products.append({
                    "name": name,
                    "link": link,
                    "price": price,
                    "image_url": image_url
                })

            except Exception as e:
                print(f"Retrying product {index + 1} due to error: {e}")
                try:
                    # Re-fetch the products and try again
                    products = driver.find_elements(By.CSS_SELECTOR, ".product-item-info")
                    product = products[index]

                    name = product.find_element(By.CSS_SELECTOR, ".product-item-name a").text
                    link = product.find_element(By.CSS_SELECTOR, ".product-item-name a").get_attribute("href")
                    price = product.find_element(By.CSS_SELECTOR, ".price-wrapper .price").text
                    image_url = product.find_element(By.CSS_SELECTOR, ".product-item-photo img").get_attribute("src")

                    price = format_price(price)

                    all_products.append({
                        "name": name,
                        "link": link,
                        "price": price,
                        "image_url": image_url
                    })
                except Exception as e:
                    print(f"Skipping product {index + 1} due to error: {e}")

        # Handle pagination
        try:
            next_button = driver.find_element(By.CSS_SELECTOR, ".action.next")
            next_page_url = next_button.get_attribute("href")  # Extract the next page URL

            if next_page_url:
                print(f"Navigating to next page: {next_page_url}")
                driver.get(next_page_url)  # Navigate to the next page directly
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".product-item-info"))
                )  # Wait for products to load
            else:
                print("No more pages. Exiting.")
                break
        except Exception as e:
            print(f"No Next button found or error: {e}")
            break  # Exit loop if there are no more pages

# Save results to JSON
with open("qatarmobiledata.json", "w", encoding="utf-8") as f:
    json.dump(all_products, f, indent=4, ensure_ascii=False)

print(f"Scraped {len(all_products)} products successfully!")
driver.quit()
