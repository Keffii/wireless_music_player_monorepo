package com.example.media_controller_iot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
        @GetMapping("/")
        public String home() {
            return "index";
        }
}

