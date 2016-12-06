module Main exposing (..)

import Debug
import MD5
import Dict
import Set
import Array
import Html exposing (program, text, textarea, div, button, pre)
import View exposing (renderProblem)
import Inputs exposing (problemInputs)


main : Program Never Model Msg
main =
    program { init = init, view = view, update = update, subscriptions = subscriptions }


type alias Model =
    { problemDay : Int
    , input : String
    , solutionPart1 : String
    , solutionPart2 : String
    , password : String
    , index : Int
    , passwordDict : Dict.Dict String String
    }


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


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


init : ( Model, Cmd msg )
init =
    ( { problemDay =
            5
      , input = Array.get 4 problemInputs |> Maybe.withDefault ""
      , solutionPart1 = ""
      , solutionPart2 = ""
      , index =
            -- Found on first pass
            1739528
      , password = ""
      , passwordDict = Dict.empty
      }
    , Cmd.none
    )


findHashesPart1 : Model -> Model
findHashesPart1 model =
    if (String.length model.password) == 8 then
        model
    else
        let
            currentHash =
                model.index
                    |> toString
                    |> ((++) model.input)
                    |> MD5.hex
        in
            if (String.slice 0 5 currentHash == "00000") then
                let
                    _ =
                        Debug.log "Found" ( currentHash, model.index, model.password )
                in
                    findHashesPart1
                        { model
                            | index = model.index + 1
                            , password = (model.password ++ (String.slice 5 6 currentHash))
                        }
            else
                findHashesPart1 { model | index = model.index + 1 }


validPositions : Set.Set String
validPositions =
    Set.fromList [ "0", "1", "2", "3", "4", "5", "6", "7" ]


findHashesPart2 : Model -> Model
findHashesPart2 model =
    if (Dict.size model.passwordDict) == 8 then
        model
    else
        let
            currentHash =
                model.index
                    |> toString
                    |> ((++) model.input)
                    |> MD5.hex
        in
            let
                position =
                    (String.slice 5 6 currentHash)

                passwordChar =
                    (String.slice 6 7 currentHash)
            in
                if (String.slice 0 5 currentHash == "00000") then
                    let
                        _ =
                            Debug.log "Found" ( currentHash, model.index, model.passwordDict, position, passwordChar )
                    in
                        if Set.member position validPositions && not (Dict.member position model.passwordDict) then
                            findHashesPart2
                                { model
                                    | index = model.index + 1
                                    , passwordDict = Dict.insert position passwordChar model.passwordDict
                                }
                        else
                            findHashesPart2 { model | index = model.index + 1 }
                else
                    findHashesPart2 { model | index = model.index + 1 }


solverPart1 : Model -> String
solverPart1 model =
    (findHashesPart1 model).password


solverPart2 : Model -> String
solverPart2 model =
    Dict.values (findHashesPart2 model).passwordDict
        |> String.join ""


view : Model -> Html.Html Msg
view model =
    div []
        [ renderProblem model ( Solve, Solve2 )
        ]
