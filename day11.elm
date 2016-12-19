module Main exposing (..)

import Array
import Html exposing (program, text, textarea, div, button, pre)
import View exposing (renderProblem)
import Inputs exposing (problemInputs)


main : Program Never Model Msg
main =
    program { init = init, view = view, update = update, subscriptions = subscriptions }


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


type Msg
    = Solve
    | Solve2


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        Solve ->
            let
                solution =
                    solverPart1 model
            in
                ( { model | solutionPart1 = solution }, Cmd.none )

        Solve2 ->
            let
                solution =
                    solverPart2 model
            in
                ( { model | solutionPart2 = solution }, Cmd.none )


type alias Model =
    { problemDay : Int
    , input : String
    , solutionPart1 : String
    , solutionPart2 : String
    }


problemDay : Int
problemDay =
    11


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


solverPart1 : Model -> String
solverPart1 model =
    "Did this one wiht pen & paper, sorry!"


solverPart2 : Model -> String
solverPart2 model =
    "Did this one wiht pen & paper, sorry!"


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
