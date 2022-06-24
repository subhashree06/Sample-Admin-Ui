import React, { useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import './App.css';
import axios from 'axios';
import { Alert, AlertTitle } from '@material-ui/lab';
import tableIcons from "./TableIcons.js";
import { Delete } from "@material-ui/icons";


// regex for email validation
const validateEmail = (email) => {
  const re = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/;
  return re.test(String(email).toLowerCase());
}


const App = () => {

  const [user, setUser] = useState([]);
  const [iserror, setIserror] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  let columns = [
    { title: 'NAME', field: 'name' },
    { title: 'EMAIL', field: 'email' },
    { title: 'ROLE', field: 'role' },
  ]


  useEffect(() => {
    axios.get(`https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`)
      .then(res => {
        const users = res.data;
        setUser(users);
        // console.log(users);
      })
  }, []);

  //function for updating the existing row details
  const handleRowUpdate = (newData, oldData, resolve) => {
    //validating the data inputs
    let errorList = []
    if (newData.name === "") {
      errorList.push("Try Again, You didn't enter the name field")
    }
    if (newData.email === "" || validateEmail(newData.email) === false) {
      errorList.push("Oops!!! Please enter a valid email")
    }
    if (newData.role === "") {
      errorList.push("Try Again, Phone number field can't be blank")
    }

    if (errorList.length < 1) {
        const updateUser = [...user];
        const index = oldData.tableData.id;
        updateUser[index] = newData;
        setUser([...updateUser]);
        resolve()
        setIserror(false)
        setErrorMessages([])
      }
        
     else {
      setErrorMessages(errorList)
      setIserror(true)
      resolve()

    }
  }


  //function for deleting a row
  const handleRowDelete = (oldData, resolve) => {
    
    const dataDelete = [...user];
    const index = oldData.tableData.id;
    dataDelete.splice(index, 1);
    setUser([...dataDelete]);
    resolve()
    
  }

  const handleDeleteRows = (event, rowData) => {
    let _data = [...user];
    rowData.forEach(rd => {
      _data = _data.filter(t => t.tableData.id !== rd.tableData.id);
    });
    setUser(_data);
  };


  return (
    <div className="app">
      <h1>Geektrust Admin UI</h1> <br /><br />

      <MaterialTable
        title="User Details"
        columns={columns}
        data={user}
        icons={tableIcons}
        options={{
          headerStyle: { borderBottomColor: 'red', borderBottomWidth: '3px', fontFamily: 'verdana' },
          actionsColumnIndex: -1,
          selection: true
        }}
        actions={[
          {
            icon: () => <Delete />,
            tooltip: "Delete Rows",
            onClick: handleDeleteRows
          }
        ]}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              handleRowUpdate(newData, oldData, resolve);

            }),
          onRowDelete: (oldData) =>
            new Promise((resolve) => {
              handleRowDelete(oldData, resolve)
            }),
        }}
        
      />

      <div>
        {iserror &&
          <Alert severity="error">
            <AlertTitle>ERROR</AlertTitle>
            {errorMessages.map((msg, i) => {
              return <div key={i}>{msg}</div>
            })}
          </Alert>
        }
      </div>

     

    </div>
  );
}

export default App;
