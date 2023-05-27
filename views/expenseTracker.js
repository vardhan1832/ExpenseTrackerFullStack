let itemList = document.getElementById('items');
const token = localStorage.getItem('token')

async function save(event){   
    try{        
        event.preventDefault();
        let userObj={        
          amount : event.target.Amount.value,
          categry: event.target.category.value,
          descript : event.target.description.value,    
        }
        const response = await axios.post('http://localhost:4000/user/add-expense',userObj,{ headers: { "Authorization" : token}})
        if(response.status === 201){
            newlist(response.data.userexpense);
        }          
    }catch(err){
        document.body.innerHTML += `<section class="container"><div style="color:red;">${err.message}</div></section>`
    }      
} 

document.getElementById('rzp-button1').onclick = async function (e){
    const response = await axios.get('http://localhost:4000/purchase/premiumMembership',{ headers: { "Authorization" : token}})
    console.log(response)
    let options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response){
            await axios.post('http://localhost:4000/purchase/updatetransactionstatus',{
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            },{ headers: { "Authorization" : token}} ).then(()=>{
                document.getElementById('rzp-button1').style.visibility = 'hidden';
                document.getElementById('rzp-update').innerHTML += `<h4 style="color: rgb(255, 255, 255);margin-top: 0.5rem;float: right">Premium Feature: </h4>`;
                document.getElementById('rzp-update').innerHTML += ` <button id="rzp-button2" onclick="leaderboard(event)" style="background-color: rgb(255, 255, 255) ;color: rgb(0, 0, 0);width: auto;height: 30px;margin-top: 0.6rem;margin-left: 3px;margin-right: 8%">Show Leaderboard</button>`
                document.getElementById('premium-expenses').innerHTML = ` <h4 style="color: white;margin-left: 47% ;margin-top: 6px;">REPORT: </h4>
                <select style="width: 200px;height: 30px;font-size: smaller;margin-top: 7px;margin-left: 8px;" name="basis" id="showexp">
                    <option value="Day to Day">Day to Day</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                </select>
                <button type="button" onclick="download()" style="margin-left: 8px;" class="btn mr-md-2 mb-md-0 mb-2 btn-outline-light">DOWNLOAD</button>
                <button type="button" onclick="display()" style="margin-left: 8px;" class="btn mr-md-2 mb-md-0 mb-2 btn-outline-light">DISPLAY FILES</button>  `    
            })

            alert('You are a Premium User Now')
        }
    }
    const rzp1 = new Razorpay(options)
    rzp1.open()
    e.preventDefault()

    rzp1.on('payment.failed', async function(response){

        const failedresponse =await axios.post('http://localhost:4000/purchase/updatetransactionstatus',{
            order_id: options.order_id,
            payment_id: false
        },{ headers: { "Authorization" : token}} )     
        alert(failedresponse.data.message)
    })
}

async function leaderboard(e){
    try{
        e.preventDefault()
        
        const response = await axios.get('http://localhost:4000/premium/showleaderboard',{ headers: { "Authorization" : token}})
        console.log(response)
        if(response.status === 201){
            document.getElementById('lead-div').innerHTML = '<h3 style="color: white;">Leaderboard: </h3>'
            document.getElementById('user-leaderboard').innerHTML = '';
            response.data.forEach(user=>{
                document.getElementById('user-leaderboard').innerHTML += ` <li style="color: black;background-color: rgba(250, 242, 255, 0.979);" class="list-group-item"> Name - ${user.name} , Total Expense - ${user.totalexpense} </li>`
            })
        }
    }catch(err){
        console.log(err)
    }
}
async function download(){
    try{
        const response =await axios.get('http://localhost:4000/user/download',{ headers: { "Authorization" : token}})
        console.log(response.status)
        if(response.status === 201 ){
         var a = document.createElement("a")
         a.href = response.data;
         a.download = 'myexpense.csv';
         a.click();
        }else{
            throw new Error(response.data.message)
        }
    }catch(err){
        console.log(err)
    }
}
async function display(){
    try{
        const response =await axios.get('http://localhost:4000/user/display',{ headers: { "Authorization" : token}})
        if(response.status === 201){
            document.getElementById('display-div').innerHTML = '<h3 style="color: white;">DOWNLOADED FILES: </h3>'
            document.getElementById('display-files').innerHTML = '';
            let i = 1;
            response.data.forEach(file=>{
               // console.log(file.filesdownloaded)
                document.getElementById('display-files').innerHTML += ` <li style="color: black;background-color: rgba(250, 242, 255, 0.979);" class="list-group-item">File ${i}   <a href = "${file.filesdownloaded}"> download</a></li>`
                i++;
            })
        }
    }catch(err){
        console.log(err)
    }
}

function newlist(e){
      let li = document.createElement('li');
      li.className='list-group-item';
      let userInfo = `${e.amount} - ${e.category}, ${e.description}` ;
      li.id = e.id;
      li.style.backgroundColor = 'rgba(250, 242, 255, 0.979)'

      li.appendChild(document.createTextNode(userInfo));

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn float-right delete ';
      deleteBtn.style.backgroundColor = 'rgb(241, 199, 199)';        
      deleteBtn.appendChild(document.createTextNode('delete'));
      li.appendChild(deleteBtn);

      var editBtn = document.createElement('button');
      editBtn.className = 'btn  float-right edit';       
      editBtn.appendChild(document.createTextNode('edit'));
      li.appendChild(editBtn);
      editBtn.style.backgroundColor = 'rgb(241, 199, 199)';
      itemList.appendChild(li);

      deleteBtn.onclick=async ()=>{   
        try{
            const res = await axios.delete( `http://localhost:4000/user/add-expense/${li.id}`,{ headers: { "Authorization" : token}})
            console.log(res)
            if(res.status === 201){
                itemList.removeChild(li); 
            }else{
                throw new Error(res.data.message)
            }  
        }
        catch(err){
            document.body.innerHTML += `<section class="container"><div style="color:red;">${err.message}</div></section>`
        }            
      }
      editBtn.onclick=async ()=>{
        try{
            document.getElementById('expAmt').value = e.amount;
            document.getElementById('selectcategory').value = e.category;
            document.getElementById('desc').value = e.description;
            const res = await axios.delete( `http://localhost:4000/user/add-expense/${li.id}`,{ headers: { "Authorization" : token}})
            console.log(res)
            if(res.status === 201){
                itemList.removeChild(li); 
            }else{
                throw new Error(res.data.message)
            }  
        }catch(err){
            document.body.innerHTML += `<section class="container"><div style="color:red;">${err.message}</div></section>`   
        }
           
      }
}

window.addEventListener('DOMContentLoaded',async ()=>{
    try{
        const response = await axios.get('http://localhost:4000/user/add-expense',{ headers: {"Authorization": token}})
        console.log(response)
        if(response.status === 201){
            if(response.data.isPremiumUser === true){
                document.getElementById('rzp-button1').style.visibility = 'hidden';
                document.getElementById('rzp-update').innerHTML += `<h4 style="color: rgb(255, 255, 255);margin-top: 0.5rem;float: right">Premium Feature: </h4>`;
                document.getElementById('rzp-update').innerHTML += ` <button id="rzp-button2" onclick="leaderboard(event)" style="background-color: rgb(255, 255, 255) ;color: rgb(0, 0, 0);width: auto;height: 30px;margin-top: 0.6rem;margin-left: 3px;margin-right: 8%">Show Leaderboard</button>`
                document.getElementById('premium-expenses').innerHTML = ` <h4 style="color: white;margin-left: 47% ;margin-top: 6px;">REPORT: </h4>
                <select style="width: 200px;height: 30px;font-size: smaller;margin-top: 7px;margin-left: 8px;" name="basis" id="showexp">
                    <option value="Day to Day">Day to Day</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                </select>
                <button type="button" onclick="download()" style="margin-left: 8px;" class="btn mr-md-2 mb-md-0 mb-2 btn-outline-light">DOWNLOAD</button>
                <button type="button" onclick="display()" style="margin-left: 8px;" class="btn mr-md-2 mb-md-0 mb-2 btn-outline-light">DISPLAY FILES</button>  `
            }
            for(var i=0;i<response.data.allexpenses.length;i++){
                newlist(response.data.allexpenses[i]);
            }
        }
    }catch(err){
        document.body.innerHTML += `<section class="container"><div style="color:red;">${err.message}</div></section>`   
    }

})    
