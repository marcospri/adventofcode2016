module View exposing (..)

import Html exposing (h1, text, textarea, div, small, pre, a, button, span)
import Html.Attributes exposing (class, href, target, style)
import Html.Events exposing (onClick)


renderProblemLink day =
    a
        [ target "_blank"
        , href ("http://adventofcode.com/2016/day/" ++ day)
        ]
        [ text ("adventofcode.com/2016/day/" ++ day)
        ]


renderGithubLink day =
    let
        dayPadded =
            if String.length day == 1 then
                "0" ++ day
            else
                day
    in
        a
            [ target "_blank"
            , href ("https://github.com/marcospri/adventofcode2016/tree/master/day" ++ dayPadded ++ ".elm")
            ]
            [ text ("[Github]")
            ]


renderProblem { problemDay, input, solutionPart1, solutionPart2 } ( solvePart1Msg, solvePart2Msg ) =
    div []
        [ div [ class "page-header" ]
            [ a [ href "index.html" ]
                [ span [ class "glyphicon glyphicon-home" ] []
                ]
            , h1 []
                [ text ("Solution to day " ++ (toString problemDay) ++ " ")
                , small []
                    [ renderGithubLink (toString problemDay)
                    , span [] [ text " " ]
                    , renderProblemLink (toString problemDay)
                    ]
                ]
            ]
        , div [ class "panel panel-defaul" ]
            [ div [ class "panel-heading" ] [ text "Problem input" ]
            , div [ class "panel-body" ] [ pre [ style [ ( "max-height", "300px" ) ] ] [ text input ] ]
            ]
        , div [ class "panel panel-defaul" ]
            [ div [ class "panel-heading" ]
                [ button [ class "btn btn-default", onClick solvePart1Msg ] [ text "Solve part 1" ]
                ]
            , div [ class "panel-body" ] [ pre [] [ text solutionPart1 ] ]
            ]
        , div [ class "panel panel-defaul" ]
            [ div [ class "panel-heading" ]
                [ button [ class "btn btn-default", onClick solvePart2Msg ] [ text "Solve part 2" ]
                ]
            , div [ class "panel-body" ] [ pre [] [ text solutionPart2 ] ]
            ]
        ]
