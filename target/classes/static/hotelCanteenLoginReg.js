function isEmpty(value) {
    return value === "" || value === undefined || value === null ? true : false;
}
const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/hotelCanteenManagment";

function loginUser() {
    if (isEmpty($("#emailId").val()) || isEmpty($("#pwdId").val())) {
        alert("Please fill Required Data");

    } else {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/hotelCanteenRegLogin.json",
            success: function (response) {
                let loginUserList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                let isValid = false;
                for (let i = 0; i < loginUserList.length; i++) {
                    if (loginUserList[i].emailId == $("#emailId").val() && loginUserList[i].password == $("#pwdId").val()) {
                        isValid = true;
                        if (loginUserList[i].userType === "CUSTOMER") {
                            localStorage.setItem("userType", "CUSTOMER");
                        } else {
                            localStorage.setItem("userType", "ADMIN");
                        }
                        localStorage.setItem("userId", loginUserList[i].userId);
                        localStorage.setItem("userData", JSON.stringify(loginUserList[i]));

                        $("#emailId").val('');
                        window.location.href = "hotelCanteenManagment.html";

                    }
                }
                if (!isValid) {
                    alert("User not found");
                }

            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
}
function registerUser() {

    if (isEmpty($("#userEmailId").val())
        || isEmpty($("#passwordId").val()) || isEmpty($("#contactId").val()) ||
        isEmpty($("#userypeId").val())) {

        alert("Please fill all the details");

    } else {
        isUserExist();
    }
}
function isUserExist() {
    $.ajax({
        type: 'get',
        contentType: "application/json",
        dataType: 'json',
        cache: false,
        url: URL + "/hotelCanteenRegLogin.json",
        success: function (response) {
            let loginUserList = [];
            for (let i in response) {
                let data = response[i];
                data["userId"] = i;
                loginUserList.push(data);
            }
            for (let i = 0; i < loginUserList.length; i++) {
                if (loginUserList[i].emailId == $("#userEmailId").val()) {

                    alert("Email is already registred!!!!");
                    return false;
                }
            }
            let requestBody = {
                "name": $("#memberNameId").val(),
                "emailId": $("#userEmailId").val(),
                "password": $("#passwordId").val(),
                "contactNum": $("#contactId").val(),
                "userType": $("#userypeId").val()
            }
            if ($("#userypeId").val() === "ADMIN") {
                if (isEmpty($("#locationId").val()) || isEmpty($("#descriptionId").val())) {

                    alert("Please fill all the details");
                    return false;

                } else {
                    requestBody['descriptionId'] = $("#descriptionId").val();
                    requestBody['locationId'] = $("#locationId").val();
                }
            }
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/hotelCanteenRegLogin.json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#regModelId').modal('hide');
                    alert("Registerd sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });

        }, error: function (error) {
            alert("Something went wrong");
        }
    });
}

$(document).ready(function () {
    $(".adminCls").hide();
    $('#regModelId').on('hidden.bs.modal', function (e) {
        $("#memberNameId").val("");
        $("#contactId").val("");
        $("#userEmailId").val("");
        $("#passwordId").val("");
        $("#userypeId").val("");
        $("#locationId").val("");
        $("#descriptionId").val("");
    })
    $('#userypeId').click(function () {
        if (this.value === "CUSTOMER") {
            $(".adminCls").hide();
        } else if (this.value === "ADMIN") {
            $(".adminCls").show();
        }
    });
    $('.carousel').carousel({
        interval: 1000
    })
})
