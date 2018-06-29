    $(function () {

    // init the validator
    // validator files are included in the download package
    // otherwise download from http://1000hz.github.io/bootstrap-validator

    $('#contact-form').validator();
    
    $('#start_listener').on('click', function (e) {
            var url = "startlistener";
            var selectedQueue = getSelectedQueue();
            $.ajax({
                type: "GET",
                url: url,
                data: {
                  queue: selectedQueue
                },
                success: function (data)
                {
                    var messageAlert = 'Listner Started successfully';
                    alertSucessMessage(messageAlert)
                },
                error: function(data){
                    alertFailure();
                }
            });
    }); 
});