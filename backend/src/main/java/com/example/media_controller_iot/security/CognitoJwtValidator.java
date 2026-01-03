package com.example.media_controller_iot.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;

@Component
public class CognitoJwtValidator {

    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    public CognitoJwtValidator(
            @Value("${aws.cognito.region}") String region,
            @Value("${aws.cognito.userPoolId}") String userPoolId) throws Exception {
        
        // Build JWK Set URL for Cognito
        String jwkSetUrl = String.format(
            "https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json",
            region,
            userPoolId
        );

        // Create JWK source using the new builder pattern
        JWKSource<SecurityContext> keySource = JWKSourceBuilder
            .create(URI.create(jwkSetUrl).toURL())
            .cache(true)  // Enable caching for better performance
            .retrying(true)  // Enable retries on failure
            .build();

        // Create JWT processor
        jwtProcessor = new DefaultJWTProcessor<>();
        JWSKeySelector<SecurityContext> keySelector = 
            new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);
    }

    public JWTClaimsSet validateToken(String token) throws Exception {
        return jwtProcessor.process(token, null);
    }
}
