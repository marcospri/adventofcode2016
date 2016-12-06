module Main exposing (..)

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
    , solutionPart1 : String
    , solutionPart2 : String
    }


init : ( Model, Cmd msg )
init =
    ( { problemDay = 3
      , input = Array.get 2 problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


findValidTriangles : List (List Int) -> Int
findValidTriangles triangles =
    triangles
        |> List.filter
            (\sides ->
                case sides of
                    h1 :: h2 :: h3 :: [] ->
                        if (h1 + h2) > h3 then
                            True
                        else
                            False

                    _ ->
                        False
            )
        |> List.length


listToListOfTriangles : List (List Int) -> List Int -> List (List Int)
listToListOfTriangles triangles l =
    case l of
        h1 :: h2 :: h3 :: tail ->
            listToListOfTriangles ([ h1, h2, h3 ] :: triangles) tail

        _ ->
            triangles |> List.reverse


solverPart1 : Model -> Int
solverPart1 model =
    model.input
        |> String.split "\n"
        |> List.map String.trim
        |> List.map (Regex.split Regex.All (Regex.regex "\\s+"))
        |> List.map (List.map String.toInt)
        |> List.map (List.map (Result.withDefault 0))
        |> List.map List.sort
        |> findValidTriangles


solverPart2 : Model -> Int
solverPart2 model =
    let
        listOfNumbers =
            model.input
                |> String.split "\n"
                |> List.map String.trim
                |> List.map (Regex.split Regex.All (Regex.regex "\\s+"))
                |> List.map (List.map String.toInt)
                |> List.map (List.map (Result.withDefault 0))
                |> List.map (List.indexedMap (,))
                |> List.concat
    in
        List.map
            (\div ->
                List.filter
                    (\( i, triangle ) ->
                        i + 1 % 3 == div
                    )
                    listOfNumbers
            )
            (List.range 0 3)
            |> List.concat
            |> List.map (\( _, v ) -> v)
            |> listToListOfTriangles []
            |> List.map List.sort
            |> findValidTriangles


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
