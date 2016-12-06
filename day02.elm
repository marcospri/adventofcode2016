module Main exposing (..)

import Debug
import Dict
import Regex
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
                        |> toString
            in
                ( { model | solutionPart1 = solution }, Cmd.none )

        Solve2 ->
            let
                solution =
                    solverPart2 model
                        |> toString
            in
                ( { model | solutionPart2 = solution }, Cmd.none )


type alias Model =
    { problemDay : Int
    , input : String
    , lastButtonPosition : ( Int, Int )
    , solutionPart1 : String
    , solutionPart2 : String
    }


init : ( Model, Cmd msg )
init =
    ( { problemDay = 2
      , input = Array.get 1 problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , lastButtonPosition = ( 0, 0 )
      }
    , Cmd.none
    )


keyPadPositionsPart1 : Dict.Dict ( Int, Int ) Int
keyPadPositionsPart1 =
    Dict.fromList
        [ ( ( -1, 1 ), 1 )
        , ( ( 0, 1 ), 2 )
        , ( ( 1, 1 ), 3 )
        , ( ( -1, 0 ), 4 )
        , ( ( 0, 0 ), 5 )
        , ( ( 1, 0 ), 6 )
        , ( ( -1, -1 ), 7 )
        , ( ( 0, -1 ), 8 )
        , ( ( 1, -1 ), 9 )
        ]


keyPadPositionsPart2 : Dict.Dict ( Int, Int ) String
keyPadPositionsPart2 =
    Dict.fromList
        [ ( ( 0, 2 ), "1" )
        , ( ( -1, 1 ), "2" )
        , ( ( 0, 1 ), "3" )
        , ( ( 1, 1 ), "4" )
        , ( ( -2, 0 ), "5" )
        , ( ( -1, 0 ), "6" )
        , ( ( 0, 0 ), "7" )
        , ( ( 1, 0 ), "8" )
        , ( ( 2, 0 ), "9" )
        , ( ( -1, -1 ), "A" )
        , ( ( 0, -1 ), "B" )
        , ( ( 1, -1 ), "C" )
        , ( ( 0, -2 ), "D" )
        ]


tail_ : List a -> List a
tail_ l =
    case List.tail l of
        Just t ->
            t

        Nothing ->
            []


get_ : Int -> Array.Array a -> a
get_ i arr =
    case Array.get i arr of
        Just t ->
            t

        Nothing ->
            Debug.crash "Out of bounds"


getPositionNumber : Dict.Dict ( Int, Int ) a -> ( Int, Int ) -> a
getPositionNumber keyboard pos =
    case Dict.get pos keyboard of
        Just n ->
            n

        Nothing ->
            Debug.crash "Out of bounds on the key pad"


getButtonSequence : Model -> Dict.Dict ( Int, Int ) a -> Array.Array a
getButtonSequence model keyboard =
    model.input
        |> Regex.replace Regex.All (Regex.regex "\\s") (\_ -> "")
        |> String.split ""
        |> List.map
            (\x ->
                case x of
                    "U" ->
                        ( 0, 1 )

                    "D" ->
                        ( 0, -1 )

                    "R" ->
                        ( 1, 0 )

                    "L" ->
                        ( -1, 0 )

                    _ ->
                        Debug.crash "Invalid character in input"
            )
        |> List.scanl
            (\( moveX, moveY ) ( x, y ) ->
                let
                    ( newX, newY ) =
                        ( x + moveX, y + moveY )
                in
                    if Dict.member ( newX, newY ) keyboard then
                        ( newX, newY )
                    else
                        ( x, y )
            )
            model.lastButtonPosition
        |> tail_
        |> List.map (getPositionNumber keyboard)
        |> Array.fromList


solverPart1 : Model -> String
solverPart1 model =
    (getMoves keyPadPositionsPart1 model)
        |> List.map toString
        |> String.join ""


solverPart2 : Model -> String
solverPart2 model =
    (getMoves keyPadPositionsPart2 model)
        |> String.join ""


getMoves : Dict.Dict ( Int, Int ) a -> Model -> List a
getMoves keyboard model =
    let
        buttonSequene =
            getButtonSequence model keyboard
    in
        model.input
            |> String.split "\n"
            |> List.map String.trim
            |> List.map String.length
            |> List.scanl (+) 0
            |> tail_
            |> List.map
                (\p ->
                    get_ (p - 1) buttonSequene
                )


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
