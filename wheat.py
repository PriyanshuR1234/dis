from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

# Set up headless Chrome
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)

# Navigate to the website
driver.get("https://procurementtactics.com/wheat-prices/")

# Wait for the page to load
time.sleep(5)

try:
    # Locate the canvas element
    canvas_element = driver.find_element("xpath", "//*[@id='post-34811']/div[1]/div/div/div[1]/div[1]/div/div[4]/div")
    print("Canvas element found.")

    # Additional logic here...

except Exception as e:
    print("Error:", e)

# Close the browser
driver.quit()
