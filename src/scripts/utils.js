function modal() {
    let isModalOpen = false;

    $('.notification').on('click', function(event) {
        event.stopPropagation();
        if (isModalOpen) {
            $('.modalNotification').fadeOut(200);
            $('.container-modalNotif').fadeOut(200);
        } else {
            $('.container-modalNotif').fadeIn(200);
            $('.modalNotification').fadeIn(200);
        }
        isModalOpen = !isModalOpen;
    });

    $(document).on('click', function() {
        if (isModalOpen) {
            $('.modalNotification').fadeOut(200);
            $('.container-modalNotif').fadeOut(200);
            isModalOpen = false;
        }
    });

    $('.modalNotification').on('click', function(event) {
        event.stopPropagation();
    });
}

$(document).ready(function() {
    modal();
});
