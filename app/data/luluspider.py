import json
import time
from memory_profiler import memory_usage
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

def scrape_lulu():
    # Set up headless Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--blink-settings=imagesEnabled=true")

    # Initialize WebDriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    # List of URLs to scrape
    base_urls = [
        "https://gcc.luluhypermarket.com/en-qa/electronics-mobiles-wearables-mobiles/?page={}",
        "https://gcc.luluhypermarket.com/en-qa/electronics-tv/?page={}",
        "https://gcc.luluhypermarket.com/en-qa/electronics-gaming/?page={}",
        "https://gcc.luluhypermarket.com/en-qa/electronics-it-accessories/?page={}",
        "https://gcc.luluhypermarket.com/en-qa/electronics-camera/?page={}",
        "https://gcc.luluhypermarket.com/en-qa/electronics-medical-equipment/?page={}"
    ]

    products_data = []

    # Function to clean and format price
    def format_price(price_text):
        try:
            return int(float(price_text.replace(",", "").split()[0]))  # Convert to integer
        except ValueError:
            return None  # Return None if conversion fails

    # Scrape each category
    for base_url in base_urls:
        page = 1  # Start from page 1
        while True:
            url = base_url.format(page)
            print(f"Scraping page {page}: {url}")
            driver.get(url)

            # Wait for products to load
            try:
                WebDriverWait(driver, 60).until(
                    EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'rounded-') and contains(@class, '32px')]"))
                )
            except TimeoutException:
                print("No products found, stopping pagination.")
                break

            # Find all products on the page
            products = driver.find_elements(By.XPATH, "//div[contains(@class, 'rounded-') and contains(@class, '32px')]")
            if not products:
                print("No more products available. Exiting pagination.")
                break

            print(f"Found {len(products)} products on page {page}.")

            for product in products:
                try:
                    # Product Name and Link
                    name_element = product.find_element(By.XPATH, ".//a[@data-testid]")
                    name = name_element.text
                    link = name_element.get_attribute("href")

                    # Product Price
                    try:
                        price_text = product.find_element(By.XPATH, ".//span[@data-testid='product-price']").text
                        price = format_price(price_text)
                    except NoSuchElementException:
                        price = None

                    # Original Price
                    try:
                        original_price_text = product.find_element(By.XPATH, ".//span[contains(@class, 'line-through')]").text
                        original_price = format_price(original_price_text)
                    except NoSuchElementException:
                        original_price = None

                    # Discount
                    try:
                        discount = product.find_element(By.XPATH, ".//div[contains(@class, 'bg-') and contains(@class, '04a550')]").text
                    except NoSuchElementException:
                        discount = "No discount"

                    # Brand
                    try:
                        brand = product.find_element(By.XPATH, ".//span[@class='brand-class']").text
                    except NoSuchElementException:
                        brand = "No brand"

                    # Image URL
                    try:
                        image_url = product.find_element(By.XPATH, ".//img").get_attribute("src")
                    except NoSuchElementException:
                        image_url = "No image"

                    # Save product data
                    product_data = {
                        "name": name,
                        "link": link,
                        "price": price,
                        "original_price": original_price,
                        "discount": discount,
                        "currency": "QAR",
                        "brand": brand,
                        "image_url": image_url
                    }
                    products_data.append(product_data)

                except Exception as e:
                    print(f"Error extracting product details: {e}")

            page += 1
            time.sleep(2)

    # Save the data to a JSON file
    with open("luludata.json", "w", encoding="utf-8") as json_file:
        json.dump(products_data, json_file, indent=4, ensure_ascii=False)

    print("Scraping finished, data saved to luludata.json")
    driver.quit()


# --- Entry point with memory tracking ---
if __name__ == "__main__":
    from multiprocessing import freeze_support
    freeze_support()  # Helps avoid multiprocessing issues on Windows

    # --- Measure memory and time ---
    start_time = time.time()
    mem_usage = memory_usage((scrape_lulu,), interval=0.5)
    end_time = time.time()

    print(f"\nTime taken: {end_time - start_time:.2f} seconds")
    print(f"Memory used: {max(mem_usage) - min(mem_usage):.2f} MiB")
