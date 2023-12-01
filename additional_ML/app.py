from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import calendar
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('random_forest_model.joblib')




@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    selected_year = data['year']
    selected_month = data['month']

    totaldays= (calendar.monthrange(int(selected_year), int(selected_month))[1])

    monthly_usage_data=0
    for days in range(1,totaldays+1):
        date_string =f"{selected_year}-{selected_month:02d}-{days:02d}"
        print(date_string)
        date_object = datetime.strptime(date_string, "%Y-%m-%d")
        day_of_week = int(date_object.strftime("%w"))
        for i in range(0,24):
            new_data = pd.DataFrame({'hour_of_day': [i], 'day_of_week': [day_of_week]})
            prediction = model.predict(new_data)[0]*4
            monthly_usage_data+=prediction

    return jsonify({'prediction': monthly_usage_data})
    # return jsonify({'prediction': prediction[0]})


@app.route('/formonthpredict', methods=['POST'])
def formonthpredict():
    data = request.get_json()
    selected_year = int(data['year'])
    selected_month = int(data['month'])
    selected_day = int(data['day'])
    print(selected_year,selected_month,selected_day)
    # totaldays= (calendar.monthrange(int(selected_year), int(selected_month))[1])

    sumTotal=0
    date_string =f"{selected_year}-{selected_month:02d}-{selected_day:02d}"
    date_object = datetime.strptime(date_string, "%Y-%m-%d")
    day_of_week = int(date_object.strftime("%w"))
    for i in range(0,24):
        new_data = pd.DataFrame({'hour_of_day': [i], 'day_of_week': [day_of_week]})
        prediction = model.predict(new_data)[0]*4
        sumTotal+=prediction

    return jsonify({'prediction': sumTotal})



if __name__ == '__main__':
    app.run(debug=True)