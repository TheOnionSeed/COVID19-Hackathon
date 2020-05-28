import os
from flask import Flask, render_template, flash, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
import io
import numpy as np
import cv2
import matplotlib
import matplotlib.pyplot as plt
import base64
import pandas as pd
import datetime


if os.getenv("NB_PREFIX"):
    PREFIX = os.getenv("NB_PREFIX")
else:
    PREFIX = ""

app = Flask(__name__, static_url_path=f'{PREFIX}/static')

#app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if PREFIX:
    from flask import url_for, send_from_directory
    from flask_reverse_proxy_fix.middleware import ReverseProxyPrefixFix
    app.config['REVERSE_PROXY_PATH'] = PREFIX
    ReverseProxyPrefixFix(app)



DATASET = os.path.join(
    app.root_path,
    'hackdata.xlsx'
)

@app.route("/")
def main():
   return render_template('index.html')

@app.route('/chart', methods=['POST'])
def chart_req():
   clicked=None
   if request.method == "POST":
      provCode=request.form['prov']
      

      if(provCode!='all'):
         dateLst,totCases=getCaseByProv(provCode,'Active_Cases_By100k')
         vacCount=getEmpByProv(provCode,'Store_Vacancies')
         empCount=getEmpByProv(provCode,'Store_Employees')
         wrkhrCount=getEmpByProv(provCode,'Worked_Hours')
         salesCount=getSalesByProv(provCode,'Transaction_Total')
      else:
         dateLst,totCases=getAllCases('Active_Cases_By100k')
         totCases=totCases.tolist()
         vacCount=getAllEmp('Store_Vacancies')
         vacCount=vacCount.tolist()
         
         empCount=getAllEmp('Store_Employees')
         empCount=empCount.tolist()

         wrkhrCount=getAllEmp('Worked_Hours')
         wrkhrCount=wrkhrCount.tolist()

         salesCount=getAllSales('Transaction_Total')
         salesCount=salesCount.tolist()
      
      dateLst=[str(day)[:10] for day in dateLst]
      response =  { 'dates' : dateLst,
                    'totCases': totCases,
                    'vacCount': vacCount,
                    'empCount': empCount,
                    'wrkhrCount': wrkhrCount,
                    'salesCount': salesCount}
   else:
      response =  { 'Status' : 'Success'}
   
   resp = jsonify(response)
   return resp

# Get Covid-19 Cases
def getCaseByProv(provCode,caseCol):
   dfs = pd.read_excel(DATASET, sheet_name='Covid_Info')
   dfs=dfs.loc[(dfs['Location_Code']==provCode)]

   return(dfs['Date'].to_numpy(),dfs[caseCol].tolist())

def getAllCases(caseCol):
   dateLst,onCases=getCaseByProv('on',caseCol)
   dateLst,abCases=getCaseByProv('ab',caseCol)
   dateLst,qcCases=getCaseByProv('qc',caseCol)

   return (dateLst,np.add(np.add(onCases,abCases),qcCases))

# Get Employee Infos
def getEmpByProv(provCode,empCol):
   if(provCode=='all'):
      return
   df_emp = pd.read_excel(DATASET, sheet_name='Store_Employment')
   df_store = pd.read_excel(DATASET, sheet_name='Store_Info')

   df_store= df_store[['Store_ID','Location_Code']]
   
   df_emp=df_emp.merge(df_store, left_on='Store_ID', right_on='Store_ID')
   df_emp=df_emp.loc[(df_emp['Location_Code']==provCode)]
   df_emp_sum=df_emp.groupby(['Date'])[empCol].sum().reset_index(name ='Tot_Count')
   #print(df_emp_sum)
   return (df_emp_sum['Tot_Count'].tolist())

def getAllEmp(caseCol):
   empCountOn=getEmpByProv('on',caseCol)
   empCountAb=getEmpByProv('ab',caseCol)
   empCountQc=getEmpByProv('qc',caseCol)
   return (np.add(np.add(empCountOn,empCountAb),empCountQc))

# Get Sales Infos
def getSalesByProv(provCode,saleCol):
   if(provCode=='all'):
      return
   df_sale = pd.read_excel(DATASET, sheet_name='Sales')
   df_store = pd.read_excel(DATASET, sheet_name='Store_Info')

   df_store= df_store[['Store_ID','Location_Code']]
   df_sale=df_sale.merge(df_store, left_on='Store_ID', right_on='Store_ID')
   df_sale=df_sale.loc[(df_sale['Location_Code']==provCode)]
   df_emp_sum=df_sale.groupby(['Date'])[saleCol].sum().reset_index(name ='Tot_Trans')
   return (df_emp_sum['Tot_Trans'].tolist())

def getAllSales(caseCol):
   salesCountOn=getSalesByProv('on',caseCol)
   salesCountAb=getSalesByProv('ab',caseCol)
   salesCountQc=getSalesByProv('qc',caseCol)
   return (np.add(np.add(salesCountOn,salesCountAb),salesCountQc))

if __name__ == "__main__":
   app.run(debug=True,host="0.0.0.0",port=8888)
   #app.run(debug=True,host="localhost",port=80)
