document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#archivar').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-form').onsubmit = ()=>{
    recips = document.querySelector('#compose-recipients');
    sub = document.querySelector('#compose-subject');
    body = document.querySelector('#compose-body');
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recips.value,
          subject: sub.value,
          body: body.value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        load_mailbox('sent');
        console.log(result);
    });
    return false;
  }

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#archivar').style.display = 'block';
  document.querySelector('#user').style.display= 'none';
  document.querySelector('#ruser').style.display= 'block';
  const user = document.querySelector('#ruser').innerHTML;
  // Show the mailbo`x and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox);
  //if (mailbox == 'inbox'){
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        principal = document.querySelector("#emails-view");
        emails.forEach(e => {
          datos = '';
          if(mailbox == 'inbox'){

            datos = e.sender;
          }else{
            datos = e.recipients;
            console.log(datos );
            if (datos.length > 3){
              datos = datos.slice(0,2)+'...';
            }
          }
          const element = document.createElement('div');
          chequeado = '';
          if(e.archived==true){
            chequeado = `<input type="checkbox"  style='{margin-top:13px; margin-right:5px;}'
            id='${e.id}' class='class_archivar'  value="read" checked>`;
          }else{
            chequeado = `<input type="checkbox"  style='{margin-top:13px; margin-right:5px;}'
            id='${e.id}' class='class_archivar'  value="read" >`;
          }
          element.id=`mail_${e.id}`;
          element.className ='div_email row';
          element.innerHTML = `
                                '${chequeado}'

                              <div class='col-11 bordeado' id='id_${e.id}'>
                                <div class='row'>
                                  <div class='col-8'>

                                      <span class='span_sender'>${ datos} </span>
                                      <span class='span_subject'> ${ e.subject.charAt(0).toUpperCase()+e.subject.slice(1) }</span>
                                  </div>
                                  <div class='col-4'>
                                      <span class='span_timestamp'>${e.timestamp}</span>
                                  </div>
                                </div>
                              </div>`;
          principal.append(element);

          //esta parte se encarga de verificar si el correo esta leido o
          // si esta leido el backgroundColor lo pone gris
          if(e.read== true){
            document.querySelector(`#id_${e.id}`).style.backgroundColor='lightgray';
          }else{
            document.querySelector(`#id_${e.id}`).style.backgroundColor='white';
          }

          //en esta parte va el algoritmo para archivar y desarchivar correos

          list_check = document.querySelectorAll(".class_archivar");


          archivar = document.querySelector('#archivar');

          archivar.onclick = ()=>{
            console.log('archivar clickeado');
            list_check.forEach(element => {
              if(element.checked==true){
                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })
                })
              }else{
                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: false
                  })
                })
              }
            })
            load_mailbox('inbox');
          }
          //aqui finaliza el algoritmo para archivar/desarchivar correos

          //aqui va la parte de hacer click en los correos
          if (mailbox == 'inbox'){

            document.querySelector(`#id_${e.id}`).onclick = ()=>{


              fetch(`/emails/${e.id}`)
              .then(response => response.json())
              .then(email => {
                  // Print email
                  console.log(email);
                  document.querySelector('#ruser').style.display= 'none';
                  document.querySelector('#user').innerHTML = `<h3>${e.sender}</h3>`;
                  document.querySelector('#user').style.display='block';
                  // ... do something else with email ...
                  document.querySelector('.div_email').style.display= 'none';
                  document.querySelector('#emails-view').innerHTML= `
                  <div><span class='reading'>From:</span> ${ e.sender}</div>
                  <div><span class='reading'>To:</span> ${ user}</div>
                  <div><span class='reading'>Subject:</span> ${ e.subject}</div>
                  <div><span class='reading'>Timestamp:</span> ${ e.timestamp}</div>
                  <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
                  <hr>
                  ${e.body}
                  <br>
                  <input type="checkbox" checked id="read" value="read">
                  <label for="read"> Read</label>
                  `
                  //aqui se pone el email como leido
                  checkbox_read = document.querySelector('#read')
                  fetch(`/emails/${e.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                  })
                  checkbox_read.onchange = ()=>{
                    if (checkbox_read.checked == false){
                      console.log('esta falso')
                      fetch(`/emails/${e.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: false
                        })
                      })
                    }else{
                      fetch(`/emails/${e.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                      })
                    }

                  }


                  //aqui se programa el click en el boton reply para responder mensaje
                  document.querySelector('#reply').onclick = ()=>{

                    compose_email();
                    document.querySelector("#compose-recipients").value = `${e.sender}`;
                    //aqui va la parte del Subject
                    re = e.subject.slice(0,3);
                    sub = ''
                    if(re != 'Re:'){
                      sub = `Re: ${e.subject}`;
                    }else{
                      sub = e.subject;
                    }
                    init_body = `On ${e.timestamp} ${e.sender} wrote: ${e.body}`
                    document.querySelector("#compose-subject").value = sub;
                    document.querySelector('#compose-body').value = init_body;
                  }

              });
            }
         }
          //aqui termina la parte de hacer click en los correos


        });
      })



      // return false;
}
