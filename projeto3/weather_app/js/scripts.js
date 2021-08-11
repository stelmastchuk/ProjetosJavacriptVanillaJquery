
$(function () {






    const accuweatherAPIkey = "ut2cs3PdmynEZpHAwq3KeJX2DTOd3h64";
    const mapboxToken = "pk.eyJ1IjoiZXJldHJpYSIsImEiOiJja3Bzc29wMDIwemRkMnBwYTA1eG12a3MyIn0.8GapDZCmJfi8dASKc8poRw";

    var weatherObject = {

        cidade: "",
        estado: "",
        pais: "",
        temperatura: "",
        texto_clima: "",
        icone: "",


    }



    function preencher_climaAgora(cidade, estado, pais, temperatura, texto_clima, icone) {

        var texto_local = cidade + "," + estado + ". " + pais;

        $("#texto_local").text(texto_local);
        $("#texto_clima").text(texto_clima);
        $("#texto_temperatura").html(String(temperatura) + "&deg");
        $("#icone_clima").css("background-image", "url('" + weatherObject.icone + "')");







    }

    function gerarGrafico(horas, temperaturas) {

        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperatura Hora a Hora'
            },
            xAxis: {
                categories: horas
            },
            yAxis: {
                title: {
                    text: 'Temperatura (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: temperaturas
            }]
        });





    }


    gerarGrafico();


    function pegarPrevisaoHoraAHora(localCode) {

        //"http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/28143?apikey=ut2cs3PdmynEZpHAwq3KeJX2DTOd3h64&language=pt-br&metric=true"


        $.ajax({

            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherAPIkey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {

                var horarios = [];
                var temperaturas = [];


                for (var a = 0; a < data.length; a++) {

                    var hora = new Date(data[a].DateTime).getHours();

                    horarios.push(String(hora) + "h");
                    temperaturas.push(data[a].Temperature.Value);

                    gerarGrafico(horarios, temperaturas);
                    $('.refresh-loader').fadeOut();


                }




            },
            error: function () {


                console.log("Erro");
                gerarErro("Erro previsao hora a hora");


            }

        });





    }


    function preencherPrevisao5Dias(previsoes) {

        $("#info_5dias").html("");

        var diasSemanas = ["Domingo", "Segunda-Feirra", "Terça-feira", "Quarta-Feirra", "Quinta-Feirra", "Sexta-Feira", "Sabado"];


        for (var a = 0; a < previsoes.length; a++) {


            var dataHoje = new Date(previsoes[a].Date);
            var dia_semana = diasSemanas[dataHoje.getDay()];


            var iconNumber = previsoes[a].Day.Icon <= 9 ? "0" + String(previsoes[a].Day.Icon) : String(previsoes[a].Day.Icon);

            icone = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";
            maxima = String(previsoes[a].Temperature.Maximum.Value);
            minima = String(previsoes[a].Temperature.Minimum.Value);

            elementoHTMLDia = '<div class="day col">';
            elementoHTMLDia += '<div class="day_inner">';
            elementoHTMLDia += '<div class="dayname">';
            elementoHTMLDia += dia_semana;
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '<div style="background-image: url(\'' + icone + '\')" class="daily_weather_icon"></div>';
            elementoHTMLDia += '<div class="max_min_temp">';
            elementoHTMLDia += minima + '&deg; / ' + maxima + '&deg;';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';


            $("#info_5dias").append(elementoHTMLDia);
            elementoHTMLDia = "";


        }



    }



    function pegarPrevisao5dias(localCode) {



        $.ajax({

            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherAPIkey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {



                $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg: / " + String(data.DailyForecasts[0].Temperature.Maximum.Value + "&deg"));


                preencherPrevisao5Dias(data.DailyForecasts);


            },
            error: function () {


                console.log("Erro");
                gerarErro("Erro previsao 5 dias");


            }

        });





    }




    function pegarTempoAtual(localCode) {

        $.ajax({

            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherAPIkey + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function (data) {



                weatherObject.temperatura = data[0].Temperature.Metric.Value;
                weatherObject.texto_clima = data[0].WeatherText;


                var iconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);



                weatherObject.icone = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";




                preencher_climaAgora(weatherObject.cidade, weatherObject.estado, weatherObject.pais, weatherObject.temperatura, weatherObject.texto_clima);


            },
            error: function () {


                console.log("Erro");
                gerarErro("Erro ao obter clima atual");


            }

        });





    }



    function pegarLocalUsuario(lat, long) {


        $.ajax({

            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherAPIkey + "&q=" + lat + "%2C%20" + long + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function (data) {



                try {
                    weatherObject.cidade = data.ParentCity.LocalizedName;

                }
                catch {

                    weatherObject.cidade = data.LocalizedName;

                }

                weatherObject.estado = data.AdministrativeArea.LocalizedName;
                weatherObject.pais = data.Country.LocalizedName;

                var localCode = data.Key;
                pegarTempoAtual(localCode);
                pegarPrevisao5dias(localCode);
                pegarPrevisaoHoraAHora(localCode);

            },
            error: function () {


                console.log("Erro");
                gerarErro("Erro no código do Local");


            }

        });


    }


    function pegarCoordenadasdaPesquisa(input) {


        input = encodeURI(input);

        $.ajax({

            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input + ".json?access_token=" + mapboxToken,
            type: "GET",
            dataType: "json",
            success: function (data) {


                try {

                    var long = data.features[0].geometry.coordinates[0];
                    var lat = data.features[0].geometry.coordinates[1];

                    pegarLocalUsuario(lat, long)

                } catch {
                    gerarErro("Erro na pesquisa do Local");

                }


            },
            error: function () {


                console.log("Erro");
                gerarErro("Erro na pesquisa do Local");


            }

        });







    }



    function pegarGeoLocation() {

        var lat_padrao = "-23.4262";
        var long_padrao = "-51.9388";


        $.ajax({

            url: "http://www.geoplugin.net/json.gp",
            type: "GET",
            dataType: "json",
            success: function (data) {



                var lat = data.geoplugin_latitude;
                var long = data.geoplugin_longitude;


                if (lat && long) {
                    pegarLocalUsuario(lat, long);
                } else {
                    pegarLocalUsuario(lat_padrao, long_padrao);

                }

            },
            error: function () {


                console.log("Erro");


            }

        });


    }



    pegarGeoLocation();



    $("#search-button").click(function () {

        $('.refresh-loader').show();
        var local = $("input#local").val();

        if (local) {

            pegarCoordenadasdaPesquisa(local);
        } else {

            alert("local invalido");

        }



    })


    $("input#local").on('keypress', function (e) {



        if (e.which == 13) {


            $('.refresh-loader').show();
            var local = $("input#local").val();

            if (local) {

                pegarCoordenadasdaPesquisa(local);
            } else {

                alert("local invalido");

            }

        }

    });



    function gerarErro(mensagem) {

        if (!mensagem) {

            mensagem = "Erro na solicitação";
        }

        $('.refresh-loader').hide();
        $("#aviso_erro").text(mensagem);
        $("#aviso_erro").slideDown();
        window.setTimeout(function () {
            $("#aviso_erro").slideUp();

        }, 4000);

    }







});