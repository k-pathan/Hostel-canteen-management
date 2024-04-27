var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const userId = localStorage.getItem("userId");
    $scope.userName = localStorage.getItem("userType");
    $scope.userData = localStorage.getItem("userData");
    $scope.userData = JSON.parse($scope.userData);
    var URL = "https://fir-1c7de-default-rtdb.firebaseio.com/hotelCanteenManagment";
    $scope.orderDetails = {};
    $scope.orderData = {};
    getAdminDetails();
    $("#orderDivId").show();
    $("#biilingId").hide();
    $("#iteamAddDivId").hide();
    $scope.feedBack = {};
    $scope.adminList = [];
    getIteamList();
    $scope.viewOrderTableData = [];
    $scope.cartCount = 0;
    $scope.foodOrderList = [];
    $("#feedbackDivId").hide();
    $scope.placeOrder = function (data) {
        $scope.orderDetails = data;
    }
    $scope.removeFoodOrderList = function (data, index) {
        $scope.foodOrderList.splice(index, 1);
        $scope.cartCount = $scope.cartCount - 1;
        $scope.cartDetails();
    }
    function getAdminDetails() {
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
                $scope.adminOriginalList = { ...response };
                $scope.adminList = loginUserList.filter(obj => obj.userType === 'ADMIN');
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.addToCart = function (data) {
        $scope.cartCount = $scope.cartCount + 1;
        delete data["$$hashKey"];
        $scope.foodOrderList.push(data);
    }
    $scope.cartDetails = function () {
        $scope.toalCost = 0;
        if ($scope.foodOrderList.length == 1) {
            $scope.toalCost = $scope.foodOrderList[0].price;
        } else {
            $scope.toalCost = $scope.foodOrderList.reduce((total, thing) => total + parseInt(thing.price), 0);
        }
    }

    $scope.PayAndOrder = function () {
        if (isEmpty($scope.orderData.date) || isEmpty($scope.orderData.time)
            || isEmpty($scope.orderData.paymentMode)) {
            alert("Please fill all details");
            return false;
        } else {
            delete $scope.orderData["$$hashKey"];
            let reqstBody = {
                "foodOrderList": $scope.foodOrderList,
                "price": $scope.toalCost,
                "orderDate": new Date().toISOString().split('T')[0],
                "orderData": $scope.orderData,
                "status": "Not Completed"

            };
            delete reqstBody["$hashKey"];
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/orderFood/" + userId + ".json",
                data: JSON.stringify(reqstBody),
                success: function (response) {
                    alert("Order placed!!!");
                    $('#cartModalId').modal('hide');
                    $scope.cartCount = 0;
                    $scope.foodOrderList = [];
                    $scope.orderData = {};
                    //$scope.switchMenu("BILLING", "billingTabId");

                    $scope.$apply();
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.updateStatus = function (data) {
        let reqstBody = {
            "status": "Completed"
        };
        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/orderFood/" + data.userId + "/" + data.childUserId + ".json",
            data: JSON.stringify(reqstBody),
            success: function (response) {
                alert("Data Updated!!!");
                $scope.getAdminTableData();
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.feedBackAdd = function () {
        delete $scope.feedBack["$$hashKey"];
        $scope.feedBack["userName"] = $scope.userData.name;
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/feedBack.json",
            data: JSON.stringify($scope.feedBack),
            success: function (response) {
                alert("Feedback added!!!");
                $scope.feedBack = {};
                getfeedBackAdd();

                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    function getfeedBackAdd() {
        delete $scope.feedBack["$$hashKey"];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/feedBack.json",
            success: function (response) {
                let feedbackList = [];
                for (let i in response) {
                    let data = response[i];
                    data["commentId"] = i;
                    feedbackList.push(data);
                }
                $scope.feedbackList = [...feedbackList];
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getOrderTableData = function (type) {
        $scope.viewOrderTableData = [];
        let orderList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/orderFood/" + userId + ".json",
            success: function (response) {
                for (let i in response) {
                    let eventData = response[i];
                    eventData["orderId"] = i;
                    orderList.push(eventData);
                }
                $scope.viewOrderTableData = [...orderList];
                //  orderList.filter(function (obj) {
                //     if (type == "BILLING") {
                //         return obj.status === "pending";
                //     } else {
                //         return obj.status != "pending";
                //     }
                //})
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getOrderData = function (data) {
        $("#ammountId").val(data.price);
        $scope.orderDetails = data;

    }

    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "hotelCanteenLoginReg.html";
    }
    function getIteamList() {
        let url = URL + "/iteamNames/" + userId + ".json";
        if ($scope.userName != 'ADMIN') {
            url = URL + "/iteamNames.json";
        }
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: url,
            success: function (lresponse) {
                $scope.foodMenuList = [];
                $scope.foodFilterMenuList = [];
                if ($scope.userName == 'ADMIN') {
                    for (let i in lresponse) {
                        let data = lresponse[i];
                        data["foodNameId"] = i;
                        $scope.foodMenuList.push(data);
                    }
                } else {
                    for (let i in lresponse) {
                        for (let j in lresponse[i]) {
                            let data = lresponse[i][j];
                            data["foodNameId"] = j;
                            data["adminId"] = i;
                            $scope.foodMenuList.push(data);
                        }
                    }
                    $scope.foodFilterMenuList = [...$scope.foodMenuList];
                    $scope.filterResturantMenu('');
                    $scope.filterHotelIteam = '';
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.filterResturantMenu = function (id) {
        $scope.foodMenuList = [];
        if (id === '') {
            $scope.foodMenuList = [];
        } else {
            $scope.foodMenuList = $scope.foodFilterMenuList.filter(obj => obj.ownerId === id);
        }

    }
    $scope.addIteam = function () {
        let requestBody = {
            "title": $("#foodNameId").val(),
            "description": $("#descriptionId").val(),
            "price": $("#priceId").val(),
            "calories": $("#calories").val(),
            "ownerId": userId
        };
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/iteamNames/" + userId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                alert("Iteam added!!!");
                clearData();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }


    function clearData() {
        $("#foodNameId").val('');
        $("#descriptionId").val('');
        $("#priceId").val('');
        $("#calories").val('');
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#orderDivId").hide();
        $("#biilingId").hide();
        $("#iteamAddDivId").hide();
        $("#feedbackDivId").hide();
        if (type == "MENU") {
            $("#orderDivId").show();
            getIteamList();
        } else if (type == "HISTORY") {
            $scope.userName == 'ADMIN' ? $scope.getAdminTableData() : $scope.getOrderTableData("HISTORY");
            $("#biilingId").show();

        } else if (type == "ADD_ITEAM") {
            $("#iteamAddDivId").show();
            clearData();

        } else if (type == "FEEDBACK") {
            $("#feedbackDivId").show();
            getfeedBackAdd();
        }
    }
    function isEmpty(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }
    $scope.getAdminTableData = function () {
        $scope.viewOrderTableData = [];
        let foodList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/orderFood.json",
            success: function (response) {
                for (let data in response) {
                    for (let x in response[data]) {
                        let eventData = response[data][x];
                        eventData["userId"] = data;
                        eventData["childUserId"] = x;
                        foodList.unshift(eventData);
                    }
                }
                $scope.viewOrderTableData = foodList.filter(function (obj) {
                    return obj.foodOrderList[0].adminId == userId;
                })
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }

});

