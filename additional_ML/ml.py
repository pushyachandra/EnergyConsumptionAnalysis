import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import LabelEncoder
import joblib


# Load your data
data = pd.read_csv('your_data.csv')

# Convert date, start time, and end time to datetime objects
data['DATE'] = pd.to_datetime(data['DATE'])
data['START TIME'] = pd.to_datetime(data['START TIME'])
data['END TIME'] = pd.to_datetime(data['END TIME'])

# Encode categorical features if needed
le = LabelEncoder()
data['NOTES'] = le.fit_transform(data['NOTES'])

# Create new features if necessary (e.g., hour of day, day of week)
data['hour_of_day'] = data['START TIME'].dt.hour
data['day_of_week'] = data['DATE'].dt.dayofweek

# Define features and target variable
features = ['hour_of_day', 'day_of_week']
X = data[features]
y = data['USAGE']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the model
model = RandomForestRegressor(n_estimators=100, random_state=42)

# Train the model
model.fit(X_train, y_train)

# Make predictions on the test set
predictions = model.predict(X_test)

joblib.dump(model, 'random_forest_model.joblib')


# Evaluate the model
mse = mean_squared_error(y_test, predictions)
print(f'Mean Squared Error: {mse}')

# Now, you can use the trained model to make predictions for new data
# new_data = pd.DataFrame({'hour_of_day': [new_hour], 'day_of_week': [new_day]})
# prediction = model.predict(new_data)
# Sample input data for prediction
new_data = pd.DataFrame({'hour_of_day': [2], 'day_of_week': [2]})

# Make a prediction using the trained model
prediction = model.predict(new_data)

print(f'Predicted Usage: {prediction[0]:.2f} kWh')
