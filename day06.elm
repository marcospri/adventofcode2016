module Main exposing (..)

import Array
import Dict
import Tuple
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
    , solutionPart1 : String
    , solutionPart2 : String
    }


problemDay : Int
problemDay =
    6


init : ( Model, Cmd msg )
init =
    ( { problemDay = problemDay
      , input = Array.get (problemDay - 1) problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


sentenceLength : Int
sentenceLength =
    8


getMessageLetters : Model -> List ( Int, String )
getMessageLetters model =
    model.input
        |> String.split "\n"
        |> List.map String.trim
        |> List.map (String.split "")
        |> List.concat
        |> List.indexedMap (,)


getLettersColumns : List ( Int, String ) -> Model -> List (List String)
getLettersColumns messageLetters model =
    List.range 0 (sentenceLength - 1)
        |> List.map
            (\div ->
                List.filter
                    (\( i, _ ) ->
                        i % sentenceLength == div
                    )
                    messageLetters
                    |> List.map (\( _, x ) -> x)
            )


counter : List comparable -> Dict.Dict comparable Int
counter list =
    list
        |> List.foldr
            (\x dict ->
                case Dict.get x dict of
                    Just i ->
                        Dict.insert x (i + 1) dict

                    Nothing ->
                        Dict.insert x 1 dict
            )
            Dict.empty


mostCommon : Dict.Dict comparable Int -> List ( comparable, Int )
mostCommon dict =
    Dict.toList dict
        |> List.sortBy (\( _, v ) -> v)
        |> List.reverse


solverPart1 : Model -> String
solverPart1 model =
    let
        messageLetters =
            getMessageLetters model
    in
        getLettersColumns messageLetters model
            |> List.map counter
            |> List.map mostCommon
            |> List.map (List.map Tuple.first)
            |> List.map List.head
            |> List.map (Maybe.withDefault "")
            |> String.join ""


solverPart2 : Model -> String
solverPart2 model =
    let
        messageLetters =
            getMessageLetters model
    in
        getLettersColumns messageLetters model
            |> List.map counter
            |> List.map mostCommon
            |> List.map List.reverse
            |> List.map (List.map Tuple.first)
            |> List.map List.head
            |> List.map (Maybe.withDefault "")
            |> String.join ""


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
