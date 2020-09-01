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
        console.log(result);
    });
  }

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
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
          }
          const element = document.createElement('div');
          element.className ='div_email row';
          element.innerHTML = `<div class='col-8'>
                                  <span class='span_sender'>${ datos } </span>
                                  <span class='span_subject'> ${ e.subject.charAt(0).toUpperCase()+e.subject.slice(1) }</span>
                              </div>
                              <div class='col-4'>
                                  <span class='span_timestamp'>${e.timestamp}</span>
                              </div>`;
          principal.append(element);
        });
      })

      return false;
}
