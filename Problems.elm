module Main exposing (..)

import Array
import Html exposing (text, div, a, h1, small)
import Html.Attributes exposing (class, href, target)
import Inputs exposing (problemInputs)
import View exposing (renderProblemLink, renderGithubLink)


main : Program Never Int msg
main =
    Html.beginnerProgram { model = Array.length problemInputs, view = view, update = update }


update : a -> b -> b
update msg model =
    model


renderProblem : number -> number -> Html.Html msg
renderProblem total index =
    let
        day =
            toString (25 - (25 - total) - index)
    in
        div [ class "col-md-12" ]
            [ div [ class "panel panel-defaul" ]
                [ div [ class "panel-body" ]
                    [ div [ class "row" ]
                        [ div [ class "col-md-4" ]
                            [ text ("Day: " ++ day)
                            ]
                        , div [ class "col-md-4" ]
                            [ a [ href ("day" ++ day ++ ".html") ] [ text "[Go to solver]" ]
                            , renderGithubLink day
                            ]
                        , div [ class "col-md-4" ]
                            [ renderProblemLink day
                            ]
                        ]
                    ]
                ]
            ]


view : Int -> Html.Html msg
view model =
    let
        problems =
            problemInputs
                |> Array.length
                |> (flip (-)) 1
                |> List.range 0
                |> List.map (renderProblem model)
    in
        div []
            [ div [ class "page-header" ]
                [ h1 []
                    [ text "Advent of Code 2016 "
                    , small [] [ text "Solved in Elm" ]
                    ]
                ]
            , div [ class "row" ] problems
            ]
