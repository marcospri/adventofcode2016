module Main exposing (..)

import Debug
import Dict
import Regex
import Array
import Char
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
    ( { problemDay = 4
      , input = Array.get 3 problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      }
    , Cmd.none
    )


type alias Room =
    { name : String
    , realName : String
    , sector : Int
    , checksum : String
    }


subMatchToRoom : List Regex.Match -> Room
subMatchToRoom match =
    case List.head match of
        Just m ->
            let
                subs =
                    List.map (Maybe.withDefault "") m.submatches
            in
                case subs of
                    name :: sector :: sum :: [] ->
                        { name = name
                        , realName = ""
                        , sector = String.toInt sector |> Result.withDefault 0
                        , checksum = sum
                        }

                    _ ->
                        Debug.crash "Malformed room, no submatches"

        Nothing ->
            Debug.crash "Malformed room, no matches"


getCheckSum : Room -> String
getCheckSum room =
    room.name
        |> Regex.replace Regex.All (Regex.regex "-") (\_ -> "")
        |> String.foldl
            (\char dict ->
                case Dict.get char dict of
                    Just i ->
                        Dict.insert char (i + 1) dict

                    Nothing ->
                        Dict.insert char 1 dict
            )
            Dict.empty
        |> Dict.toList
        |> List.sortBy (\( k, v ) -> ( -v, k ))
        |> List.take 5
        |> List.map (\( char, _ ) -> char)
        |> List.map String.fromChar
        |> String.join ""


decrypt : Room -> String
decrypt room =
    room.name
        |> Debug.log "string"
        |> String.map
            (\c ->
                if c == '-' then
                    ' '
                else
                    c
                        |> Char.toCode
                        |> flip (-) 97
                        |> (+) room.sector
                        |> (flip (%)) 26
                        |> (+) 97
                        |> Char.fromCode
            )


parseInput : String -> Int
parseInput input =
    input
        |> String.split "\n"
        |> List.map String.trim
        |> List.map (Regex.find Regex.All (Regex.regex "([\\w-]+)-(\\d+)\\[(\\w+)\\]"))
        |> List.map subMatchToRoom
        |> List.filter
            (\r ->
                r.checksum == getCheckSum r
            )
        |> List.map .sector
        |> List.sum


solverPart1 : Model -> Int
solverPart1 model =
    model.input
        |> parseInput


solverPart2 : Model -> String
solverPart2 model =
    model.input
        |> String.split "\n"
        |> List.map String.trim
        |> List.map (Regex.find Regex.All (Regex.regex "([\\w-]+)-(\\d+)\\[(\\w+)\\]"))
        |> List.map subMatchToRoom
        |> List.filter
            (\r ->
                r.checksum == getCheckSum r
            )
        |> List.map (\r -> { r | realName = decrypt r })
        |> List.filter
            (\r ->
                String.contains "storage" r.realName
            )
        |> List.map (\x -> x.realName ++ " " ++ (toString x.sector))
        |> String.join "\n"


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
