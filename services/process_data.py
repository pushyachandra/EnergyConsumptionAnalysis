import os
from google.cloud import storage
import mysql.connector
from dotenv import load_dotenv
import csv
import codecs
from datetime import datetime
import argparse

# Load environment variables from .env file
load_dotenv()

# Set your Google Cloud Storage credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Set your MySQL database credentials
mysql_config = {
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'host': os.getenv('MYSQL_HOST'),
    'database': os.getenv('MYSQL_DATABASE'),
}

parser = argparse.ArgumentParser()
parser.add_argument('--email', help='Email of the user')
parser.add_argument('--file', help='Name of the file')
args = parser.parse_args()

def download_from_gcs(bucket_name, file_name):
    """Download file from Google Cloud Storage."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    # Download the file to a local temporary file
    temp_file_path = '../services/files/temp.csv'
    blob.download_to_filename(temp_file_path)

    return temp_file_path

def insert_into_mysql(data):
    """Insert relevant data into MySQL database."""
    connection = mysql.connector.connect(**mysql_config)
    cursor = connection.cursor()

    # Modify the SQL query based on your table structure
    query = "INSERT INTO upload_testing (date, start_time, end_time, units, cost, email) VALUES "
    for row in data:
        query+="('"+str(row[0])+"','"+str(row[1])+"','"+str(row[2])+"',"+str(row[3])+","+str(row[4])+",'"+str(args.email)+"'), "

    query=query[:-2]+';'
    cursor.execute(query)

    connection.commit()
    connection.close()

def parse_csv(file_path):
    """Parse relevant data from CSV file."""
    relevant_data = []
    
    with codecs.open(file_path, 'r', encoding='utf-8-sig') as file:
        
        for _ in range(5):
            next(file)
        
        reader = csv.DictReader(file, delimiter=',', skipinitialspace=True)

        # Skip the first row (he    ader row)
        next(reader, None)

        for row in reader:
            print(row)
            if row.get('TYPE') == 'Electric usage':
                print("here")
                date_str = row.get('DATE')
                start_time_str = row.get('START TIME')
                end_time_str = row.get('END TIME')
                usage = float(row.get('USAGE').replace(' kWh', ''))
                cost = float(row.get('COST').replace('$', ''))

                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                start_time = datetime.strptime(start_time_str, '%H:%M').time()
                end_time = datetime.strptime(end_time_str, '%H:%M').time()
                relevant_data.append((date, start_time, end_time, usage, cost))
    print(len(relevant_data))
    return relevant_data

def main():
    print("here")
    print(args)
    # Replace these with your actual values
    gcs_bucket_name = os.getenv('GOOGLE_BUCKET_NAME')
    gcs_file_name = str(args.file)
    print("this one",gcs_file_name)

    # Download file from Google Cloud Storage
    local_file_path = download_from_gcs(gcs_bucket_name, gcs_file_name)

    # Parse relevant data from CSV
    relevant_data = parse_csv(local_file_path)

    # Insert relevant data into MySQL database
    insert_into_mysql(relevant_data)

    # Cleanup: Delete the temporary file if needed
    os.remove(local_file_path)

if __name__ == '__main__':
    main()
