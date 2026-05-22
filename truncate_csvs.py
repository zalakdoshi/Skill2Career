import pandas as pd
import os

data_dir = os.path.dirname(os.path.abspath(__file__))

csv_files = {
    'LanguageWorkedWith.csv': 100,
    'FrameworkWorkedWith.csv': 100,
    'DatabaseWorkedWith.csv': 100,
    'PlatformWorkedWith.csv': 100,
    'job_skills.csv': 5000
}

print("Starting truncation of CSV files to make them deployment-friendly...")

for filename, nrows in csv_files.items():
    filepath = os.path.join(data_dir, filename)
    if os.path.exists(filepath):
        size_mb_before = os.path.getsize(filepath) / (1024 * 1024)
        print(f"Reading {filename} (Size: {size_mb_before:.2f} MB)...")
        
        # Read the exact number of rows we need
        df = pd.read_csv(filepath, nrows=nrows)
        
        # Overwrite the original file with the sampled/truncated data
        df.to_csv(filepath, index=False)
        
        size_mb_after = os.path.getsize(filepath) / (1024 * 1024)
        print(f"Truncated {filename} to {len(df)} rows (New Size: {size_mb_after:.4f} MB).")
    else:
        print(f"Warning: {filename} not found in {data_dir}")

print("CSV truncation complete! Files are now ready for Vercel deployment.")
