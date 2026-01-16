import requests
import sys
import time

def trigger_cron(url):
    print(f"Triggering Cron Job at: {url}")
    try:
        start_time = time.time()
        response = requests.get(url, timeout=60) # Set a reasonable timeout
        end_time = time.time()
        
        duration = end_time - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Duration: {duration:.2f} seconds")
        
        if response.status_code == 200:
            print("Success! Cron job executed.")
            print("Response:", response.text)
        else:
            print(f"Failed. Status: {response.status_code}")
            print("Response:", response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"Error triggering cron job: {e}")

if __name__ == "__main__":
    # Default local URL, but allow override
    # Change this to your production URL when deploying
    # e.g. https://your-project.vercel.app/api/cron
    DEFAULT_URL = "http://localhost:3000/api/cron"
    
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    
    trigger_cron(target_url)
